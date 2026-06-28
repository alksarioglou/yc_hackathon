import QRCode from "qrcode";

function buildQRMatrix(url: string, size = 29): boolean[][] {
  const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
  const modules = qr.modules;
  const moduleCount = modules.size;

  const matrix: boolean[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    const rowData: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      rowData.push(modules.get(row, col) === 1);
    }
    matrix.push(rowData);
  }

  if (moduleCount > size) {
    const offset = Math.floor((moduleCount - size) / 2);
    return matrix
      .slice(offset, offset + size)
      .map((row) => row.slice(offset, offset + size));
  }

  return matrix;
}

export function generateQRMatrixSync(url: string, size = 29): boolean[][] {
  return buildQRMatrix(url, size);
}

export async function generateQRMatrix(
  url: string,
  size = 29,
): Promise<boolean[][]> {
  return buildQRMatrix(url, size);
}