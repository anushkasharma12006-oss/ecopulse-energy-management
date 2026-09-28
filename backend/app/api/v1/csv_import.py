from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.imports import CsvImportResponse
from app.services import csv_service

router = APIRouter(prefix="/import", tags=["CSV Import Foundation"])


@router.post("/csv", response_model=CsvImportResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and ingest a CSV containing energy generation, storage, and load telemetry."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must have a .csv extension")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    result = csv_service.parse_and_import_csv(db, contents, filename=file.filename)
    if not result.success:
        raise HTTPException(status_code=422, detail=result.message)

    return result


@router.get("/template", response_class=PlainTextResponse)
def get_csv_template():
    """Retrieve sample CSV header format and demonstration rows."""
    return csv_service.generate_sample_csv_text()


@router.post("/sample", response_model=CsvImportResponse)
def import_built_in_sample(db: Session = Depends(get_db)):
    """Ingest standard sample telemetry data from built-in generator."""
    sample_text = csv_service.generate_sample_csv_text().encode("utf-8")
    return csv_service.parse_and_import_csv(db, sample_text, filename="standard_sample_telemetry.csv")
