// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const getSpeech = (text, voices) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const speech = (txt) => {
        const lang = "ko-KR";
        const utterThis = new SpeechSynthesisUtterance(txt);

        utterThis.lang = lang;

        // Find a Korean voice
        const kor_voice = voices.find(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            (voice) => voice.lang === lang || voice.lang === lang.replace("-", "_")
        );

        if (kor_voice) {
            utterThis.voice = kor_voice;
        } else {
            console.error('Korean voice not found.');
            return;
        }

        // Play the speech
        window.speechSynthesis.speak(utterThis);
    };

    // Check if voices are available before attempting speech
    if (voices.length > 0) {
        speech(text);
    } else {
        console.error('Voices are not yet loaded.');
    }
};
