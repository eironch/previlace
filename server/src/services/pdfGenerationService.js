import PDFDocument from "pdfkit";

function generateQuizResultPdf(quizResult) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(20).text("Quiz Results", { align: "center" });
      doc.moveDown();

      doc.fontSize(14).text(`Title: ${quizResult.title || "Quiz Session"}`);
      doc.fontSize(12).text(`Mode: ${quizResult.mode || "practice"}`);
      doc.text(
        `Date: ${quizResult.timing?.startedAt ? new Date(quizResult.timing.startedAt).toLocaleDateString() : new Date().toLocaleDateString()}`
      );
      doc.moveDown();

      doc.fontSize(16).text("Score Summary", { underline: true });
      doc.fontSize(12);
      doc.text(`Total Questions: ${quizResult.score?.total || 0}`);
      doc.text(`Correct Answers: ${quizResult.score?.correct || 0}`);
      doc.text(`Incorrect Answers: ${quizResult.score?.incorrect || 0}`);
      doc.text(`Percentage: ${quizResult.score?.percentage || 0}%`);
      doc.moveDown();

      if (quizResult.timing?.totalTimeSpent) {
        const totalSeconds = Math.floor(quizResult.timing.totalTimeSpent / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        doc.text(`Total Time: ${minutes}:${seconds.toString().padStart(2, "0")}`);
        doc.moveDown();
      }

      if (quizResult.analytics?.topicPerformance) {
        doc.fontSize(16).text("Topic Performance", { underline: true });
        doc.fontSize(12);
        doc.moveDown(0.5);

        const topicPerformance = Array.from(
          quizResult.analytics.topicPerformance.entries()
        );
        topicPerformance.forEach(([topic, performance]) => {
          doc.text(
            `${topic}: ${performance.correct}/${performance.total} (${performance.percentage}%)`
          );
        });
        doc.moveDown();
      }

      if (quizResult.analytics?.categoryPerformance) {
        doc.fontSize(16).text("Category Performance", { underline: true });
        doc.fontSize(12);
        doc.moveDown(0.5);

        const categoryPerformance = Array.from(
          quizResult.analytics.categoryPerformance.entries()
        );
        categoryPerformance.forEach(([category, performance]) => {
          doc.text(
            `${category}: ${performance.correct}/${performance.total} (${performance.percentage}%)`
          );
        });
        doc.moveDown();
      }

      if (quizResult.analytics?.weakTopics && quizResult.analytics.weakTopics.length > 0) {
        doc.fontSize(16).text("Areas for Review", { underline: true });
        doc.fontSize(12);
        doc.moveDown(0.5);

        quizResult.analytics.weakTopics.forEach((topic) => {
          doc.text(`- ${topic}`);
        });
        doc.moveDown();
      }

      if (quizResult.answers && quizResult.answers.length > 0) {
        doc.addPage();
        doc.fontSize(16).text("Answer Review", { underline: true });
        doc.moveDown();

        quizResult.answers.forEach((answer, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }

          doc.fontSize(14).text(`Question ${index + 1}`);
          doc.fontSize(12);

          if (answer.question?.questionText) {
            doc.text(answer.question.questionText, { width: 500 });
          }

          doc.text(`Your Answer: ${answer.userAnswer || "No answer"}`);
          doc.text(
            `Correct Answer: ${answer.correctAnswer || "N/A"}`,
            { color: answer.isCorrect ? "green" : "red" }
          );
          doc.text(`Status: ${answer.isCorrect ? "Correct" : "Incorrect"}`);

          if (answer.question?.explanation) {
            doc.fontSize(11).fillColor("gray");
            doc.text(`Explanation: ${answer.question.explanation}`, {
              width: 500,
            });
            doc.fillColor("black");
          }

          doc.moveDown();
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export default { generateQuizResultPdf };
