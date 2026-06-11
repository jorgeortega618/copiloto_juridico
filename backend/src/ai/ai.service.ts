import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-fake-dev-key',
    });
  }

  async queryExpediente(orgId: string, userId: string, query: string, expedienteId?: string) {
    if (!query) throw new BadRequestException('Query cannot be empty');

    // 1. Embeber la pregunta del usuario
    let vectorString: string;
    try {
      const queryEmbeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
      });
      const queryVector = queryEmbeddingResponse.data[0].embedding;
      vectorString = `[${queryVector.join(',')}]`;
    } catch (e: any) {
      this.logger.error('Error contacting OpenAI for embeddings:', e);
      throw new BadRequestException(
        'Error de autenticación con OpenAI. Verifica que la variable OPENAI_API_KEY esté configurada correctamente en Railway.'
      );
    }

    // 2. Similarity Search en pgvector (Top 5 chunks)
    // Buscamos sobre documentos de esta organización (y opcionalmente este expediente)
    let relevantChunks: any[];
    if (expedienteId) {
      // Filtrar por expedienteId específico
      relevantChunks = await this.prisma.$queryRaw`
        SELECT c.id, c.content, c.chunk_index, d.file_name,
               1 - (c.embedding <=> ${vectorString}::vector) as similarity
        FROM document_chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE d.org_id = ${orgId} AND d.expediente_id = ${expedienteId}
        ORDER BY c.embedding <=> ${vectorString}::vector
        LIMIT 5;
      `;
    } else {
      // Búsqueda global en toda la organización
      relevantChunks = await this.prisma.$queryRaw`
        SELECT c.id, c.content, c.chunk_index, d.file_name,
               1 - (c.embedding <=> ${vectorString}::vector) as similarity
        FROM document_chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE d.org_id = ${orgId}
        ORDER BY c.embedding <=> ${vectorString}::vector
        LIMIT 5;
      `;
    }

    if (!relevantChunks || relevantChunks.length === 0) {
      return { answer: 'No se encontró información relevante en los documentos analizados.', sources: [] };
    }

    // 3. Promptear a ChatGPT con el Contexto (RAG System)
    const contextText = relevantChunks
      .map(c => `[Documento: ${c.file_name} | Relevancia: ${(c.similarity * 100).toFixed(2)}%]\n...${c.content}...`)
      .join('\n\n');

    const systemPrompt = `
      Eres un asistente legal avanzado especializado en el análisis documental de expedientes jurídicos.
      Tus respuestas deben ser profesionales, objetivas, exactas y fundamentadas EXCLUSIVAMENTE en la información de los fragmentos que se te proporcionan como CONTEXTO. 
      Si la información no está en el contexto, indica claramente que "No hay suficiente información en el expediente cargado para responder a tu consulta", no inventes datos. Si te preguntan algo fuera del contexto jurídico del documento, ignóralo cordialmente.
    `;

    try {
      const chatResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2, // Baja creatividad, máxima certeza
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `CONTEXTO DOCUMENTAL:\n${contextText}\n\nPREGUNTA DEL ABOGADO: ${query}` }
        ],
      });

      const answer = chatResponse.choices[0].message.content;

      // 4. Guardar histórico de la consulta para auditoría y facturación si corresponde
      await this.prisma.aiQuery.create({
        data: {
          orgId,
          expedienteId,
          userId,
          queryText: query,
          responseText: answer || 'Respuesta vacía generada',
          sources: relevantChunks.map(c => ({ id: c.id, fileName: c.file_name, similarity: c.similarity }))
        }
      });

      return { 
        answer, 
        sources: relevantChunks.map(c => ({ fileName: c.file_name, snippet: c.content.substring(0, 50) + '...', similarity: c.similarity }))
      };
    } catch (e: any) {
      this.logger.error('Error contacting OpenAI for chat:', e);
      throw new BadRequestException(
        'Error generando la respuesta con OpenAI. Verifica tu API KEY o el saldo de tu cuenta.'
      );
    }
  }
}
