# Lingzhi MiniApp (灵芝优选)

> **CRITICAL ARCHITECTURE RULE (长期记忆/Long-Term Memory)**
>
> **THIS PROJECT IS A PURE UNICLOUD + UNI-APP PROJECT.**
> **该项目唯采用纯 UNICLOUD 云开发 + UNI-APP 架构。**
>
> - **DO NOT USE**: Java Backend, Spring Boot, Local MySQL, Local Redis, or Docker Containers.
> - **DO NOT REVERT**: Do not revert to the legacy `backend/` directory or `docker-compose.yml`. These are archived and deprecated.
> - **DEPLOYMENT**: Must use DCloud UniCloud Service Space (Aliyun/Tencent) via HBuilderX.

## Technical Stack

- **Frontend**: UniApp (Vue 3)
- **Backend Logic**: UniCloud Cloud Functions (Node.js)
- **Database**: UniCloud JSON Database (Schema-based)

## Directory Structure

- `frontend/`: Main application source code.
  - `uniCloud-aliyun/`: Contains `cloudfunctions` and `database` schemas.
- `_ARCHIVED_backend/`: (Deprecated) Old Java backend. Do not use.
- `_ARCHIVED_docker-compose.yml`: (Deprecated) Old container setup. Do not use.

## How to Run

1. Open `frontend` folder in **HBuilderX**.
2. Connect to UniCloud Service Space.
3. Upload Schemas (`frontend/uniCloud-aliyun/database`).
4. Upload Cloud Functions (`frontend/uniCloud-aliyun/cloudfunctions`).
5. Run -> Run to Web / App.
