function handlePrompt(req) {
  const { question } = req;

  // Call LLM function and get the response

  const responseText = "Hi I am alright, how are you doing";

  return responseText;
}

module.exports = {
  handlePrompt,
};
