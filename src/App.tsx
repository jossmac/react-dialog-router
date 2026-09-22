import './App.css';

export default function App() {
  return (
    <main className="splash">
      <div className="splash-atmosphere" aria-hidden="true" />

      <div className="splash-stage">
        <div className="splash-copy">
          <p className="splash-brand">react-dialog-router</p>
          <h1 className="splash-headline">Nested dialogs, finally routable.</h1>
          <p className="splash-lede">
            An experimental React library for stack-based modal navigation — back, reset, and escape
            that behave like a router.
          </p>
          <div className="splash-actions">
            <a
              className="splash-cta splash-cta-primary"
              href="https://github.com/jossmac/react-dialog-router"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
            <a
              className="splash-cta splash-cta-secondary"
              href="https://github.com/jossmac/react-dialog-router/blob/main/src/components/ModalDialog.routed.stories.tsx"
              target="_blank"
              rel="noreferrer"
            >
              See examples
            </a>
          </div>
        </div>

        <div className="splash-visual" aria-hidden="true">
          <div className="dialog-stack">
            <div className="dialog-layer dialog-layer-3">
              <span className="dialog-chrome" />
              <span className="dialog-line dialog-line-short" />
            </div>
            <div className="dialog-layer dialog-layer-2">
              <span className="dialog-chrome" />
              <span className="dialog-line" />
              <span className="dialog-line dialog-line-mid" />
            </div>
            <div className="dialog-layer dialog-layer-1">
              <span className="dialog-chrome" />
              <span className="dialog-line" />
              <span className="dialog-line dialog-line-mid" />
              <span className="dialog-line dialog-line-short" />
              <div className="dialog-route">
                <span>home</span>
                <span aria-hidden="true">→</span>
                <span>details</span>
                <span aria-hidden="true">→</span>
                <span className="dialog-route-active">confirm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
