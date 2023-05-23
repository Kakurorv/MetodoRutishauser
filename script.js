function generateMatrix() {
  const matrixSizeInput = document.getElementById('matrix-size');
  const matrixSize = parseInt(matrixSizeInput.value);

  if (isNaN(matrixSize) || matrixSize < 2) {
    alert('Digite um tamanho válido para a matriz (2 ou mais).');
    return;
  }

  const matrixTable = document.getElementById('matrix-table');
  matrixTable.innerHTML = '';

  for (let i = 0; i < matrixSize; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < matrixSize; j++) {
      const cell = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      cell.appendChild(input);
      row.appendChild(cell);
    }
    matrixTable.appendChild(row);
  }

  matrixTable.style.display = 'table';
}

function calculateEigenvalues() {
  const matrixTable = document.getElementById('matrix-table');
  const rows = matrixTable.getElementsByTagName('tr');

  let matrix = [];
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    const row = [];
    for (let j = 0; j < cells.length; j++) {
      const input = cells[j].getElementsByTagName('input')[0];
      const value = parseFloat(input.value);
      if (isNaN(value)) {
        alert('Preencha todos os campos com valores numéricos.');
        return;
      }
      row.push(value);
    }
    matrix.push(row);
  }

  const resultDiv = document.getElementById('result');
  const eigenvaluesDiv = document.getElementById('eigenvalues');
  const eigenvectorsDiv = document.getElementById('eigenvectors');
  eigenvaluesDiv.innerHTML = '';
  eigenvectorsDiv.innerHTML = '';

  const { eigenvalues, eigenvectors } = rutishauser(matrix);
  resultDiv.style.display = 'block';

  eigenvaluesDiv.innerHTML = eigenvalues
    .map((value) => `<div>${value.toFixed(4)}</div>`)
    .join('');

  eigenvectorsDiv.innerHTML = eigenvectors
    .map((vector) => `<div>${vector.map((value) => value.toFixed(4)).join(', ')}</div>`)
    .join('');
}

function rutishauser(matrix) {
  const tolerance = 0.01;
  const maxIterations = 100;

  const n = matrix.length;
  let a = matrix;

  const eigenvalues = [];
  const eigenvectors = [];

  for (let i = 0; i < n; i++) {
    eigenvectors[i] = Array.from({ length: n }, (_, index) => index === i ? 1 : 0);
  }

  let iteration = 0;
  let maxOffDiagonal = getMaxOffDiagonal(a);
  while (maxOffDiagonal > tolerance && iteration < maxIterations) {
    const maxIndex = getMaxOffDiagonalIndex(a);
    const p = a[maxIndex.row][maxIndex.col];
    const q = (a[maxIndex.col][maxIndex.col] - a[maxIndex.row][maxIndex.row]) / (2 * p);
    const t = q >= 0 ? 1 / (q + Math.sqrt(1 + q * q)) : -1 / (-q + Math.sqrt(1 + q * q));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;

    const b = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === maxIndex.row && j === maxIndex.row) {
          b[i][j] = c * c * a[i][i] - 2 * c * s * a[i][j] + s * s * a[j][j];
        } else if (i === maxIndex.col && j === maxIndex.col) {
          b[i][j] = s * s * a[i][i] + 2 * c * s * a[i][j] + c * c * a[j][j];
        } else if ((i === maxIndex.row && j === maxIndex.col) || (i === maxIndex.col && j === maxIndex.row)) {
          b[i][j] = (c * c - s * s) * a[i][j] + c * s * (a[i][i] - a[j][j]);
        } else {
          b[i][j] = a[i][j];
        }
      }
    }

    const v = Array.from({ length: n }, (_, index) => index === maxIndex.row ? c : 0);
    v[maxIndex.col] = s;

    for (let i = 0; i < n; i++) {
      const temp = Array.from({ length: n }, (_, index) => 0);
      for (let j = 0; j < n; j++) {
        temp[j] = eigenvectors[j][i];
      }

      for (let j = 0; j < n; j++) {
        eigenvectors[j][i] = c * temp[j] - s * temp[maxIndex.col] * v[j];
      }
    }

    a = b;
    maxOffDiagonal = getMaxOffDiagonal(a);
    iteration++;
  }

  for (let i = 0; i < n; i++) {
    eigenvalues[i] = a[i][i];
  }

  return { eigenvalues, eigenvectors };
}

function getMaxOffDiagonal(matrix) {
  const n = matrix.length;
  let max = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const value = Math.abs(matrix[i][j]);
      if (value > max) {
        max = value;
      }
    }
  }

  return max;
}

function getMaxOffDiagonalIndex(matrix) {
  const n = matrix.length;
  let maxIndex = { row: 0, col: 1 };
  let max = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const value = Math.abs(matrix[i][j]);
      if (value > max) {
        max = value;
        maxIndex = { row: i, col: j };
      }
    }
  }

  return maxIndex;
}
