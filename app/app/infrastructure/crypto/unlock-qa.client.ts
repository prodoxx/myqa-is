export async function unlockQuestionAndAnswer() {
  return await new Promise((resolve, reject) =>
    setTimeout(() => resolve('Finished'), 2_500)
  );
}
