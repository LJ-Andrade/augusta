# Technical Specifications

> **Uso de este archivo**: Este documento contiene las especificaciones técnicas (Specs) para la funcionalidad que se está desarrollando activamente (Fase 2 - Definition).
> Una vez que la funcionalidad ha sido implementada, los detalles clave se registran en `DEVLOG.md` y este archivo se limpia para la siguiente tarea.

---

## 🛠 Feature Activa: Chatbot Multi-Cliente (MySQL & Agnostic LLM Provider)

### 1. Data Models (Base de Datos MySQL)
- **Chatbot**:
  - `id`, `name`, `system_prompt`, `is_active`, `provider` (enum: 'groq', 'openai', etc., default 'groq'), `model` (string).
  - *Relaciones*: `hasMany(ChatSession::class)`, `hasMany(ChatbotKnowledge::class)`
- **ChatbotKnowledge** (Base de Conocimientos):
  - `id`, `chatbot_id`, `content` (text), `embedding` (vector/json), `metadata` (json).
- **ChatSession**:
  - `id`, `chatbot_id`, `session_uuid` (o `user_id` si es autenticado).
- **ChatMessage**:
  - `id`, `chat_session_id`, `role`, `content`.

### 2. Backend API & Services
- **LLM Service Layer**:
  - `GroqService`: Orquestador de inferencia LLM con soporte para historial e inyección de contexto.
  - `EmbeddingService`: Integración con **Google Gemini (`v1beta`)** para generación de vectores (model: `gemini-embedding-001`).
- **Conversación con Memoria**:
  - Soporte para envío de historial (`history[]`) en endpoints de prueba para mantener contexto *stateless*.

### 3. Frontend Panel de Administración
- **Rutas**:
  - `/admin/chatbots`: Listado general.
  - `/admin/chatbots/:id/edit`: Edición base.
  - `/admin/chatbots/:id/knowledge`: Gestión de RAG (subida de fragmentos y visualización detallada).
  - `/admin/chatbots/:id/test`: Simulador de chat con soporte de memoria.
- **Wiki**: Guía integrada para admins sobre configuración de API Keys y RAG.

### 4. Functional Requirements
- **RAG (Retrieval-Augmented Generation)**: Búsqueda por similitud de coseno en MySQL para inyectar fragmentos relevantes en el prompt del bot.
- **División de Textos**: Los textos largos se fragmentan automáticamente antes de ser vectorizados.
- **Seguridad**: API Keys gestionadas vía `.env`.

### 5. UI/UX Requirements
- Tema Dark con acentos ámbar (Conocimiento) y cian (Test).
- Modales para visualización de contenido completo de fragmentos.
- **Chatbot Form Layout**:
  - **Row 1 (Two Columns)**: 
    - **Left Column**: Identity Card + Suggested Questions Card (Stacked vertically, no forced full height).
    - **Right Column**: Personality Card (System Prompt) + Welcome Message Card (Stacked vertically).
  - **Row 2**: Model Configuration Card (Full width).
  - **Row 3**: Actions (Save and Cancel buttons).
