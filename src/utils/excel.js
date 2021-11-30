import XLSX from 'xlsx'

function readExcel(file, { setIsLoading, onLoad }) {
  setIsLoading(true)
  const types = file.name.split('.')[1]
  const fileType = ['xlsx', 'xlc', 'xlm', 'xls', 'xlt', 'xlw', 'csv'].some((item) => item == types)
  if (!fileType) {
    alert('格式错误！请重新选择')
    return
  }

  const reader = new FileReader()
  const result = []
  reader.onload = function (e) {
    const data = e.target.result
    const wb = XLSX.read(data, {
      type: 'binary',
    })
    wb.SheetNames.forEach((sheetName) => {
      result.push({
        sheetName,
        sheet: XLSX.utils.sheet_to_json(wb.Sheets[sheetName]),
      })
    })
    setTimeout(() => {
      setIsLoading(false)
    }, 0)
    onLoad(result)
  }
  reader.readAsBinaryString(file)

  return { result }
}

export { readExcel }
