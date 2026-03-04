# Arduino setup for button input

Johnny-Five talks to the board over **Firmata**. You do not upload a custom sketch for the button; you upload StandardFirmata and let the Node test program control/read the board.

## 1. Upload StandardFirmata to the Arduino

1. Open **Arduino IDE**.
2. **File → Examples → Firmata → StandardFirmata**.
3. Select your board (**Tools → Board**) and port (**Tools → Port**).
4. Click **Upload**.

## 2. Wiring (digital button)

- **Button pin:** default in the test program is **digital pin 2** (change `BUTTON_PIN` in `scripts/test-button.js` if you use another pin).
- **Wiring (internal pull-up):**
  - One leg of the button → **pin 2**.
  - Other leg → **GND**.

With pull-up, **released** = pin reads **HIGH** (normal). **Pressed** = pin reads **LOW** (error). The test program maps LOW → error state, HIGH → normal state.

If your signal is inverted (e.g. external circuit drives HIGH = error), swap the logic in the Node script or wire accordingly.

## 3. Run the test

From the project root:

```bash
node scripts/test-button.js
```

or:

```bash
yarn test:button
```

Leave the Arduino connected via USB so the script can open the serial port.
