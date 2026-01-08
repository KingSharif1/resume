import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface ChatMessage {
    id: string;
    resume_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export const chatRepository = {
    /**
     * Get all chat messages for a specific resume
     */
    async getByResumeId(resumeId: string): Promise<ChatMessage[]> {
        try {
            const messages = await sql`
                SELECT id, resume_id, role, content, created_at
                FROM resume_chat_messages
                WHERE resume_id = ${resumeId}
                ORDER BY created_at ASC
            `;
            return messages as ChatMessage[];
        } catch (error) {
            console.error('[chatRepository] Error fetching messages:', error);
            return [];
        }
    },

    /**
     * Save a single chat message
     */
    async saveMessage(resumeId: string, role: 'user' | 'assistant', content: string): Promise<ChatMessage | null> {
        try {
            const [message] = await sql`
                INSERT INTO resume_chat_messages (resume_id, role, content)
                VALUES (${resumeId}, ${role}, ${content})
                RETURNING id, resume_id, role, content, created_at
            `;
            return message as ChatMessage;
        } catch (error) {
            console.error('[chatRepository] Error saving message:', error);
            return null;
        }
    },

    /**
     * Save multiple chat messages in a batch
     */
    async saveMessages(resumeId: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<boolean> {
        try {
            // Use a transaction to insert all messages
            for (const msg of messages) {
                await sql`
                    INSERT INTO resume_chat_messages (resume_id, role, content)
                    VALUES (${resumeId}, ${msg.role}, ${msg.content})
                `;
            }
            return true;
        } catch (error) {
            console.error('[chatRepository] Error saving messages batch:', error);
            return false;
        }
    },

    /**
     * Delete all chat messages for a specific resume
     */
    async deleteByResumeId(resumeId: string): Promise<boolean> {
        try {
            await sql`
                DELETE FROM resume_chat_messages
                WHERE resume_id = ${resumeId}
            `;
            return true;
        } catch (error) {
            console.error('[chatRepository] Error deleting messages:', error);
            return false;
        }
    },

    /**
     * Delete a specific message by ID
     */
    async deleteMessage(messageId: string): Promise<boolean> {
        try {
            await sql`
                DELETE FROM resume_chat_messages
                WHERE id = ${messageId}
            `;
            return true;
        } catch (error) {
            console.error('[chatRepository] Error deleting message:', error);
            return false;
        }
    }
};
