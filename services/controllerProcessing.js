module.exports = async (res, func, errMessage) => {
  try {
    const result = await func();
    if (result[0]) return res.json({ data: result[0] });
    res.json({ error: errMessage });
  } catch (error) {
    console.log("Error:", error);
    res.send({ error: `${errMessage}: ${error.message}` });
  }
};
