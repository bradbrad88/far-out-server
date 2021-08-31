module.exports = async (res, func, errMessage) => {
  try {
    const result = await func();
    if (result[0]) return res.json({ data: result[0] });
    console.log(errMessage);
    res.status(500).json({ error: result[1] });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: `${errMessage}: ${error.message}` });
  }
};
