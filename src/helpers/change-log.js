export const formatCamelCase = (str) => {
  const sectionStrArr = str.split('_');
  return sectionStrArr.map((sectionStr, index) => {
    if (index > 0) {
      return `${sectionStr[0].toUpperCase()}${sectionStr.slice(1)}`;
    }
    return sectionStr;
  }).join('');
};

export const getFloors = (floors) => {
  if (!floors) return '';
  const sortedFloors = floors.sort((x, y) => {
    if (x < y) return -1;
    if (x === y) return 0;
    return 1;
  });
  const splitFloors = [];
  let tempArray = [];
  sortedFloors.forEach((floor, index) => {
    if (index > 0) {
      if (floor - sortedFloors[index - 1] !== 1) {
        splitFloors.push(tempArray);
        tempArray = [];
      }
    }
    tempArray.push(floor);
    if (index === sortedFloors.length - 1) {
      splitFloors.push(tempArray);
    }
  });
  return splitFloors.map((item) => {
    if (item.length === 1) return item;
    if (item.length === 2) return item.join('、');
    return `${item[0]}-${item[item.length - 1]}`;
  }).join('、');
};
