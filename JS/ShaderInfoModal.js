const shaderModal = document.querySelector("[data-shader-info-modal]");
const shaderOpenButton = document.querySelector("[data-shader-info-open]");
const shaderCloseButtons = document.querySelectorAll("[data-shader-info-close]");
const shaderCodeTarget = document.querySelector("[data-shader-code]");

let shaderLoaded = false;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlightGlsl(source) {
  const tokenPattern =
    /(\/\/.*|\/\*[\s\S]*?\*\/|\b(?:uniform|varying|attribute|precision|const|in|out|inout)\b|\b(?:void|float|int|bool|vec[234]|mat[234]|sampler2D)\b|\b(?:if|else|for|while|return|break|continue|discard)\b|\b(?:sin|cos|tan|dot|mix|step|smoothstep|fract|floor|abs|pow|min|max|clamp|length|normalize|texture2D)\b|\bgl_[A-Za-z0-9_]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\())/g;

  return escapeHtml(source).replace(tokenPattern, (token) => {
    let tokenType = "function";

    if (token.startsWith("//") || token.startsWith("/*")) {
      tokenType = "comment";
    } else if (/^(uniform|varying|attribute|precision|const|in|out|inout)$/.test(token)) {
      tokenType = "qualifier";
    } else if (/^(void|float|int|bool|vec[234]|mat[234]|sampler2D)$/.test(token)) {
      tokenType = "type";
    } else if (/^(if|else|for|while|return|break|continue|discard)$/.test(token)) {
      tokenType = "keyword";
    } else if (/^(sin|cos|tan|dot|mix|step|smoothstep|fract|floor|abs|pow|min|max|clamp|length|normalize|texture2D)$/.test(token)) {
      tokenType = "builtin";
    } else if (/^gl_/.test(token)) {
      tokenType = "builtin";
    } else if (/^\d/.test(token)) {
      tokenType = "number";
    }

    return `<span class="glsl-token glsl-${tokenType}">${token}</span>`;
  });
}

async function loadShaderSource() {
  if (shaderLoaded || !shaderCodeTarget) {
    return;
  }

  try {
    const response = await fetch("./Shaders/VoidFragment.glsl");
    if (!response.ok) {
      throw new Error("Failed to load shader source");
    }

    const source = await response.text();
    shaderCodeTarget.innerHTML = highlightGlsl(source);
    shaderLoaded = true;
  } catch {
    shaderCodeTarget.textContent = "Unable to load shader source.";
  }
}

function openShaderModal() {
  if (!shaderModal) {
    return;
  }

  shaderModal.hidden = false;
  document.body.classList.add("modal-open");
  loadShaderSource();
}

function closeShaderModal() {
  if (!shaderModal) {
    return;
  }

  shaderModal.hidden = true;
  document.body.classList.remove("modal-open");
}

if (shaderOpenButton && shaderModal) {
  shaderOpenButton.addEventListener("click", openShaderModal);

  shaderCloseButtons.forEach((button) => {
    button.addEventListener("click", closeShaderModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !shaderModal.hidden) {
      closeShaderModal();
    }
  });
}
