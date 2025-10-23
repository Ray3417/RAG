# 多模态RAG系统

## 阶段一：多模态RAG项目需求描述、技术栈规划与接口设计

### 1. 项目背景与需求

1. **PDF 文档处理**

   * 用户上传 PDF 文件；

   * 后端完成 **OCR、版面解析、Markdown 转换**；

   * 提供文档解析状态查询与预览。

2. **索引构建**

   * 将解析得到的 Markdown 文档进行**切分（chunking）**；

   * 使用 Embedding 模型（OpenAI Embeddings）将片段向量化；

   * 保存至 **FAISS 向量数据库**，用于后续检索。

3. **对话问答（RAG）**

   * 用户输入问题，系统先在向量数据库中检索相关片段；

   * 将检索结果与用户问题一起交给 LLM 生成答案；

   * 答案中附带引用（citations），方便追溯来源。

   * 支持**流式输出（SSE）**，提升交互体验。

   * 支持**历史对话记忆**（基于 InMemorySaver），并提供清空功能。

4. **健壮性需求**

   * 系统在没有上传文档时也能正常回答（走模型自带知识）；

   * 所有接口有**清晰的 API 约定**，方便前端对接。

### 2. 技术栈规划

#### 2.1 **后端技术**

* **FastAPI**：高性能 Python Web 框架，自动生成 Swagger UI。

* **Uvicorn**：ASGI 服务器，支持异步处理。

* **LangChain / LangGraph**：RAG 框架，管理对话状态与检索逻辑。

* **Unstructured / fitz (PyMuPDF)**：PDF 解析、OCR、图片处理。

* **FAISS**：Facebook 开源的向量数据库，用于相似检索。

#### 2.2 **前端技术**

* **Figma**：快速完成 UI 原型设计；

* **React / Next.js（TypeScript）**：实现流式 SSE 接口调用、前端展示。

#### 2.3 **AI 模型与 API**

* **OpenAI Embeddings**：用于向量化（`text-embedding-3-small` / `large`）；

* **对话模型（LLM）**：支持通用对话（如 DeepSeek-Chat / OpenAI GPT-4）。

#### 2.4 **环境与依赖**

* Python >= 3.9

* 主要依赖：`fastapi`、`uvicorn`、`python-multipart`、`langchain`、`faiss-cpu`、`unstructured`、`pymupdf`、`paddleocr`

### 3. 接口规划

我们采用 **RESTful API** 风格，分为 4 大模块：

1. **健康检查（Health）**

   * `/health`：确认服务正常运行。

2. **PDF 处理（PDF Service）**

   * `/pdf/upload`：上传 PDF 文件；

   * `/pdf/parse`：触发解析任务；

   * `/pdf/status`：查询解析进度；

   * `/pdf/page`：获取 PDF 页图（原始/解析）；

   * `/pdf/chunk`：根据 citationId 获取片段。

3. **索引构建（Index Service）**

   * `/index/build`：构建向量索引；

   * `/index/search`：检索相似片段。

4. **对话（Chat Service）**

   * `/chat`：RAG 聊天（SSE 流式输出，包含 citations）；

   * `/chat/clear`：清空当前会话历史。

## 阶段二：后端功能思路规划

### 1. 项目结构

```plaintext
backend/
├─ app.py                        # 入口与路由（FastAPI）
├─ services/
│  ├─ pdf_service.py             # 上传/解析/页图/可视化
│  ├─ index_service.py           # 切分/向量化/索引/检索
│  └─ rag_service.py             # RAG 检索+生成流（SSE）与会话历史
├─ data/                         # 解析与索引产物（按 fileId 分目录）
│  └─ f_xxx/
│     ├─ original.pdf
│     ├─ output.md
│     ├─ pages/{original|parsed}/page-0001.png
│     └─ index_faiss/{index.faiss,index.pkl}
├─ .env
└─ requirements.txt
```

* `services/*` 可单独测试、复用、替换（比如换别的向量库/LLM）。

* `data/<fileId>/…` 上传pdf后自动生成，用于临时查看中间件，便于排错。

### 2. 错误处理与返回规范

**目标**：**前端可预测**、**便于排查**。

* 统一错误体：

```json
{ "error": "CODE", "message": "人类可读描述" }
```

* 常见错误码建议：

  * `FILE_NOT_FOUND`（`fileId` 不存在）

  * `NEED_PARSE_FIRST`（没 `output.md` 就建索引）

  * `INDEX_NOT_FOUND`（索引没建）

  * `PAGE_NOT_FOUND`（页码越界）

  * `OCR_FAILED / PARSE_FAILED / INDEX_BUILD_ERROR`

**示意**：

```python
return JSONResponse({"error":"INDEX_NOT_FOUND","message":"请先构建索引"}, status_code=400)
```

### 3. 性能、可观测性与稳定性

* **进度可见**：解析阶段分阶段更新 `/status`；

* **日志可读**：关键里程碑打印（上传成功、开始 OCR、导出 MD、渲染页图、完成）；

* **幂等**：`/index/build` 再次调用可复用已有索引（返回 `{"ok":true,"reused":true}`）；

* **资源控制**：解析时限制并发，避免 OCR 占满 CPU；

* **超时与回退**：LLM 流式异常时，回退为整段生成 + 手动切片；

* **Windows 兼容**：路径用 `pathlib`；端口冲突换 `8001`；中文文件名注意编码。

## 阶段三：RAG后端功能开发与测试

