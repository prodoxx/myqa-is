import axios from 'axios';

export async function viewQuestionAnswer(questionId: number) {
  try {
    const result = await axios.post('/api/v1/view-answer', {
      questionId,
    });

    if (!result?.data?.question || result?.data?.answer) {
      throw new Error('API did not return either the question or answer');
    }

    return result?.data as {
      question: string;
      answer: string;
    };
  } catch (error) {
    console.error('Failed to load question');
    throw error;
  }
}
