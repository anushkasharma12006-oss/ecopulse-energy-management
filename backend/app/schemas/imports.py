from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class CsvImportResponse(BaseModel):
    success: bool
    filename: str
    records_processed: int
    imported_counts: Dict[str, int]
    message: str
    sample_records: Optional[List[Dict[str, Any]]] = None
