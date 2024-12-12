export async function viewQuestionAnswer() {
  let answer = '';

  await new Promise((resolve) =>
    setTimeout(() => {
      answer = 'This is the answer to your question';
      resolve('Loaded');
    }, 2_500)
  );

  return answer;
}
