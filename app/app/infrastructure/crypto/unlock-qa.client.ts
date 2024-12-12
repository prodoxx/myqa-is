export async function unlockQuestionAndAnswer() {
  return await new Promise((resolve, reject) =>
    setTimeout(() => reject('Finished'), 2_500)
  );
}
