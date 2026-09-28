import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.user import router as user_router
from .api.loans import router as loans_router
from .api.reports import router as reports_router
from .api.form_generator import router as form_generator_router
from .api.root import router as root_router
from .core.database import create_db_and_tables

app = FastAPI(
    title='FastAPI JWT', openapi_url='/openapi.json', docs_url='/docs',
    description='fastapi jwt'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://10.209.0.250:5173',
        'http://10.209.0.250:4173',
        'http://10.209.0.250:86',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def on_startup() -> None:
    create_db_and_tables()


app.include_router(root_router)
app.include_router(user_router)
app.include_router(loans_router)
app.include_router(reports_router)
app.include_router(form_generator_router)

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
