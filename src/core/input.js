// Physical key codes, so ZQSD on AZERTY and WASD on QWERTY both work
const KEY_MAP = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'backward', ArrowDown: 'backward',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};

export class Input {
  #active = new Set();

  constructor(target = window) {
    target.addEventListener('keydown', (e) => {
      const action = KEY_MAP[e.code];
      if (!action) return;
      this.#active.add(action);
      e.preventDefault(); // stop arrow keys from scrolling the page
    });
    target.addEventListener('keyup', (e) => this.#active.delete(KEY_MAP[e.code]));
    target.addEventListener('blur', () => this.#active.clear());
  }

  isDown(action) {
    return this.#active.has(action);
  }

  /** Returns -1, 0 or 1 depending on which of the two actions is held. */
  axis(positive, negative) {
    return (this.isDown(positive) ? 1 : 0) - (this.isDown(negative) ? 1 : 0);
  }
}
