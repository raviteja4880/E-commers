import React from "react";

function Loader({ text = "Loading..." }) {
  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(255, 255, 255, 0.85)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      backdropFilter: "blur(2px)",
    },
    spinner: {
      width: "55px",
      height: "55px",
      border: "5px solid rgba(0,0,0,0.1)",
      borderTop: "5px solid #007bff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    text: {
      marginTop: "15px",
      fontSize: "1.1rem",
      fontWeight: 500,
      color: "#333",
    },
    // Keyframes added inline using CSS injection
    keyframes: `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  };

  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.overlay}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>{text}</p>
      </div>
    </>
  );
}

export default Loader;
