# checkInQuizBot
A GroupMe bot that I have hosted using AWS Lambda that can send reminders at regular intervals and will quiz you based on a Quizlet set
I used a Lamba scheduler to send a reminder to a random person every time it is scheduled.
Additionally, it can "quiz" the users when the text "#quizme". It will scrape the given Quizlet set and send back one random term.
