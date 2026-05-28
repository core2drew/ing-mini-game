export const getCorrectRandomInspirationalMessage = () => {
  const inspirationMessages = [
    'Excellent work — you nailed it!',
    'Brilliantly done — you really knocked it out of the park!',
    'Okay, we get it—you’re the main character. Keep slaying.',
    'Amazing job. Now please go sit in a corner so the rest of us can feel like we’re contributing something.',
    `Wow, nailed it. I'd congratulate you, but I don't want to encourage you to keep making us look bad.`,
    `You did it perfectly on the first try. I hate you a little bit, but mostly I’m just impressed.`,
    `Congratulations on achieving basic competence. We are all very proud of you doing your job.`,
    `Oh, look at that. You did the job you were actually supposed to do. Someone notify the media.`,
    `Excellent work — you nailed it! Do you want a medal, or can we finally move on with our lives?`,
  ];
  return inspirationMessages[Math.floor(Math.random() * inspirationMessages.length)];
};

export const getWrongRandomInspirationalMessage = () => {
  const inspirationMessages = [
    `Just call it a "creative choice" and move on.`,
    `On the bright side, you just learned one definitive way not to do it.`,
    `Erasers exist for a reason. If we were perfect, pencils wouldn't have them.`,
    `Don't worry, nobody was looking (hopefully).`,
    `Well, at least you gave the universe a plot twist.`,
    `Perfect people are boring anyway.`,
    `Don't worry — every mistake is just a lesson in disguise.`,
    `At least you're being consistent at keeping life unpredictable.`,
    `That wasn't a blunder, it was a highly calculated risk... that just happened to backfire.`,
  ];
  return inspirationMessages[Math.floor(Math.random() * inspirationMessages.length)];
};
