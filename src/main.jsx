import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './redux/store'
import App from './App'
import './index.css'

// Safely patch Node.prototype.removeChild and insertBefore to handle third-party DOM mutations (e.g., Plyr / YouTube API)
if (typeof window !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child);
      }
      return child;
    }
    return originalRemoveChild.call(this, child);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return this.appendChild(newNode);
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };
}

// Catch and suppress YouTube iframe API teardown errors from www-widgetapi.js
window.addEventListener('error', (event) => {
  if (
    event?.message?.includes("getAttribute") ||
    event?.message?.includes("removeChild") ||
    event?.filename?.includes("www-widgetapi.js")
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (
    event?.reason?.message?.includes("getAttribute") ||
    event?.reason?.message?.includes("removeChild")
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
