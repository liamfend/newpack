export default (cols, data, fileName = 'data export') => {
  let context = `${cols.map(h => `${h.title || ''}`).join(',')} \n `;

  context += data.map(item => ` ${cols.map(col => `"${col.render('', item)}"  `).join(',')}  `).join(' \n ');

  let blob = new Blob([context], { type: 'data:text/csv;charset=utf-8' });
  blob = new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type });
  const objectUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${fileName}.csv`;

  link.click();
};
