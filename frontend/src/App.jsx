import React, { useState, useCallback } from "react";
import LessonViewer from "./components/LessonViewer.jsx";
import ChatBox from "./components/ChatBox.jsx";

const SAMPLE_LESSON = `
Photosynthesis is the process by which green plants and some other organisms convert light energy into chemical energy.
This process occurs mainly in the chloroplasts of plant cells, where the pigment chlorophyll absorbs sunlight.
Using carbon dioxide from the air and water from the soil, plants produce glucose (a type of sugar) and release oxygen as a by-product.
The overall simplified equation for photosynthesis is:
6CO2 + 6H2O + light energy → C6H12O6 + 6O2.
Photosynthesis is essential for life on Earth because it forms the base of most food chains and maintains the balance of oxygen and carbon dioxide in the atmosphere.
`;

function App() {
  const [lessonSource, setLessonSource] = useState("sample"); // "sample" | "custom"
  const [customLessonDraft, setCustomLessonDraft] = useState("");
  const [lessonTitle, setLessonTitle] = useState("Photosynthesis");
  const lesson =
    lessonSource === "sample"
      ? SAMPLE_LESSON.trim()
      : (customLessonDraft || "").trim();

  const [highlightedText, setHighlightedText] = useState("");
  const [highlightContext, setHighlightContext] = useState("");
  const [showChat, setShowChat] = useState(false);

  const handleHighlightAsk = useCallback((payload) => {
    // payload can be either a string (backward compatible) or { text, context }
    if (typeof payload === "string") {
      setHighlightedText(payload);
      setHighlightContext("");
    } else {
      setHighlightedText(payload?.text || "");
      setHighlightContext(payload?.context || "");
    }
    setShowChat(true);
  }, []);

  const handleOpenChatWithoutHighlight = useCallback(() => {
    setHighlightedText("");
    setHighlightContext("");
    setShowChat(true);
  }, []);

  const switchToSample = () => {
    setLessonSource("sample");
    setLessonTitle("Photosynthesis");
  };

  const switchToCustom = () => {
    setLessonSource("custom");
    if (!lessonTitle || lessonTitle === "Photosynthesis") setLessonTitle("My Lesson");
  };

  const handleUploadLesson = async (file) => {
    if (!file) return;
    const text = await file.text();
    setCustomLessonDraft(text);
    setLessonSource("custom");
    if (!lessonTitle || lessonTitle === "Photosynthesis") {
      const name = file.name?.replace(/\.[^.]+$/, "") || "My Lesson";
      setLessonTitle(name);
    }
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>EduAgent Lesson Helper</h1>
        <p>Highlight any part of the lesson and ask your doubt instantly.</p>
      </header>

      <main className="app-main">
        <section className="lesson-section">
          <div className="lesson-header">
            <h2>Lesson: {lessonTitle}</h2>
            <button className="primary-btn" onClick={handleOpenChatWithoutHighlight}>
              Ask EduAgent (no highlight)
            </button>
          </div>

          <div className="lesson-source">
            <div className="lesson-source-row">
              <button
                className={lessonSource === "sample" ? "chip-btn active" : "chip-btn"}
                onClick={switchToSample}
                type="button"
              >
                Use sample lesson
              </button>
              <button
                className={lessonSource === "custom" ? "chip-btn active" : "chip-btn"}
                onClick={switchToCustom}
                type="button"
              >
                Paste / import my lesson
              </button>
            </div>

            {lessonSource === "custom" && (
              <div className="lesson-editor">
                <div className="lesson-editor-top">
                  <label className="field">
                    <span className="field-label">Title</span>
                    <input
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="My Lesson"
                    />
                  </label>

                  <label className="file-btn" title="Upload a .txt file">
                    Upload .txt
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      onChange={(e) => handleUploadLesson(e.target.files?.[0])}
                    />
                  </label>
                </div>

                <textarea
                  value={customLessonDraft}
                  onChange={(e) => setCustomLessonDraft(e.target.value)}
                  placeholder="Paste your lesson here…"
                  rows={6}
                />

                {!lesson && (
                  <div className="lesson-warning">
                    Paste or upload a lesson to start reading.
                  </div>
                )}
              </div>
            )}
          </div>

          <LessonViewer
            lesson={lesson || "Paste or upload a lesson above to start reading."}
            onAskEduAgent={handleHighlightAsk}
          />
        </section>

        {showChat && (
          <section className="chat-section">
            <ChatBox
              lesson={lesson || SAMPLE_LESSON.trim()}
              initialHighlighted={highlightedText}
              initialHighlightContext={highlightContext}
              onClose={() => setShowChat(false)}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
