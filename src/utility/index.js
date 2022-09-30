const uid = () => Math.random().toString(16).slice(2) + Date.now();

const uiid = () => Math.floor(new Date().valueOf() * Math.random());

const parseResult = (results) => {
  const array = [];
  for (let i = 0; i < results.rows.length; ++i) {
    array.push(results.rows.item(i));
  }
  return array;
};

export {uid, uiid, parseResult};
