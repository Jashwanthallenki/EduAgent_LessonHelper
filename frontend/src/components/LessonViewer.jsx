import React, { useState, useRef, useCallback, useEffect } from "react";
import HighlightButton from "./HighlightButton.jsx";

function LessonViewer({ lesson, onAskEduAgent }) {
  const containerRef = useRef(null);
  const [selectionInfo, setSelectionInfo] = useState({
    text: "",
    context: "",
    visible: false,
    position: null
  });

  const getOffsetsWithinContainer = (range, container) => {
    // Compute start/end character offsets of the selection relative to container text.
    const startRange = document.createRange();
    startRange.selectNodeContents(container);
    startRange.setEnd(range.startContainer, range.startOffset);
    const start = startRange.toString().length;

    const endRange = document.createRange();
    endRange.selectNodeContents(container);
    endRange.setEnd(range.endContainer, range.endOffset);
    const end = endRange.toString().length;

    return { start, end };
  };

  const buildContextWindow = (fullText, start, end, windowSize = 220) => {
    const beforeStart = Math.max(0, start - windowSize);
    const afterEnd = Math.min(fullText.length, end + windowSize);
    const before = fullText.slice(beforeStart, start).trimStart();
    const selected = fullText.slice(start, end);
    const after = fullText.slice(end, afterEnd).trimEnd();

    return `${before}\n<<<HIGHLIGHT>>>\n${selected}\n<<<END_HIGHLIGHT>>>\n${after}`.trim();
  };

  const updateSelection = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectionInfo({ text: "", context: "", visible: false, position: null });
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setSelectionInfo({ text: "", context: "", visible: false, position: null });
      return;
    }

    const anchor = selection.anchorNode;
    const focus = selection.focusNode;
    if (!container.contains(anchor) || !container.contains(focus)) {
      setSelectionInfo({ text: "", context: "", visible: false, position: null });
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (!rect || !containerRect || rect.width === 0 || rect.height === 0) {
      setSelectionInfo({ text: "", context: "", visible: false, position: null });
      return;
    }

    let context = "";
    try {
      const fullText = container.innerText || "";
      const { start, end } = getOffsetsWithinContainer(range, container);
      if (start !== end) {
        context = buildContextWindow(fullText, Math.min(start, end), Math.max(start, end));
      }
    } catch (e) {
      // If offset computation fails, keep context empty (still works as before)
      context = "";
    }

    const position = {
      top: Math.max(8, rect.top - containerRect.top - 45),
      left: Math.min(
        containerRect.width - 260,
        Math.max(8, rect.left - containerRect.left)
      )
    };

    setSelectionInfo({
      text,
      context,
      visible: true,
      position
    });
  }, []);

  const handleMouseUp = () => {
    updateSelection();
  };

  const handleClickAway = useCallback(
    (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSelectionInfo({ text: "", context: "", visible: false, position: null });
        window.getSelection()?.removeAllRanges();
      }
    },
    [containerRef]
  );

  const handleAsk = () => {
    if (!selectionInfo.text) return;
    onAskEduAgent({ text: selectionInfo.text, context: selectionInfo.context });
    setSelectionInfo({ text: "", context: "", visible: false, position: null });
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    document.addEventListener("selectionchange", updateSelection);
    document.addEventListener("mousedown", handleClickAway);

    return () => {
      document.removeEventListener("selectionchange", updateSelection);
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [updateSelection, handleClickAway]);

  return (
    <div
      ref={containerRef}
      className="lesson-viewer"
      onMouseUp={handleMouseUp}
      onTouchEnd={updateSelection}
    >
      <div className="lesson-text">{lesson}</div>

      <HighlightButton
        visible={selectionInfo.visible}
        onClick={handleAsk}
        position={selectionInfo.position}
        textPreview={
          selectionInfo.text.length > 80
            ? selectionInfo.text.slice(0, 77) + "..."
            : selectionInfo.text
        }
      />
    </div>
  );
}

export default LessonViewer;
