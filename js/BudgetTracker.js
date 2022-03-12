export default class BudgetTracker {
  constructor(querySelectorString) {
    this.root = document.querySelector('#app');
    this.root.innerHTML = BudgetTracker.html();
    this.root.querySelector('.new-entry').addEventListener('click', () => {
      this.onNewEntryBtnClick();
    });
    //load initial data from local storage
    this.load();
  }
  static html() {
    return `
    <table class="budget-tracker">
    <thead>
      <tr>
        <th>Date</th>
        <th>Discription</th>
        <th>Type</th>
        <th>Amount</th>
        <th></th>
      </tr>
    </thead>
    <tbody class="entries">
    </tbody>
    <tbody>
      <tr>
        <!-- makes so that is at the end of our columns -->
        <td colspan="5" class="controls">
          <button type="button" class="new-entry">New entry</button>
        </td>
      </tr>
    </tbody>
        <tfoot>
            <tr>
                <td colspan="5" class="summary">
                <strong>Total:</strong>
                <span class="total">$0.00</span>
                </td>
            </tr>
        </tfoot>
    </table>
      `;
  }
  static entryHtml() {
    return `
        <tr>
          <td>
              <input class="input input-date" type="date" />
          </td>
            <td>
                <input
              class="input input-description"
              type="text"
              placeholder="add decription"/>
            </td>
          <td>
          <select name="" id="" class="input input-type">
            <option value="income">income</option>
            <option value="expense">expense</option>
          </select>
          </td>
            <td>
              <input type="number" class="input input-amount" />
            </td>
            <td>
              <button type="button" class="delete-entry">&#10005;</button>
          </td>
      </tr>
    `;
  }
  load() {
    const entries =
      JSON.parse(localStorage.getItem('budget-tracker-entries')) || '[]';
    for (const entry of entries) {
      this.addEntry(entry);
    }
    this.updateSummary();
  }

  updateSummary() {
    //get an array of the row, where then we can destructure and pull the type and amounts
    const total = this.getEntryRows().reduce((total, row) => {
      const amount = row.querySelector('.input-amount').value;
      const isExprense = row.querySelector('.input-type').value === 'expense';
      //to decided wether the adding value to total should be negative or positive (aka add to or subtract from)
      const modifier = isExprense ? -1 : 1;
      //running total always plus amount
      return total + amount * modifier;
    }, 0);

    const totalFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(total);

    this.root.querySelector('.total').textContent = totalFormatted;
  }

  save() {
    //want an array to use the array map method
    const data = this.getEntryRows().map((row) => {
      return {
        date: row.querySelector('.input-date').value,
        description: row.querySelector('.input-description').value,
        type: row.querySelector('.input-type').value,
        amount: parseFloat(row.querySelector('.input-amount').value), //float parse so we keep all nums(decimals)
      };
    });
    localStorage.setItem('budget-tracker-entries', JSON.stringify(data));
    this.updateSummary();
  }
  //default entry value = a {empty object}
  addEntry(entry = {}) {
    this.root
      .querySelector('.entries')
      .insertAdjacentHTML('beforeend', BudgetTracker.entryHtml());
    //will always be the row we just added
    const row = this.root.querySelector('.entries tr:last-of-type');
    row.querySelector('.input-date').value =
      entry.data || new Date().toISOString().replace(/T.*/, ''); //regex to get everything before the T then all else just become empty string =''
    //description exist input value becomes that else default to empty string
    row.querySelector('.input-description').value = entry.description || '';
    row.querySelector('.input-type').value = entry.type || 'income';
    row.querySelector('.input-amount').value = entry.amount || 0;
    row.querySelector('.delete-entry').addEventListener('click', (e) => {
      this.onDeleteEntryBtnClick(e);
    });
    row.querySelectorAll('.input').forEach((inputField) => {
      inputField.addEventListener('change', () => {
        this.save();
      });
    });
  }

  getEntryRows() {
    //helper to return all active rows
    return Array.from(this.root.querySelectorAll('.entries tr'));
  }
  onNewEntryBtnClick() {
    this.addEntry();
  }

  onDeleteEntryBtnClick(e) {
    //use closes('element, class, ect...) targets closest element that meets param passed in
    //and remove() is just called on an element (dont need parent to remove)
    e.target.closest('tr').remove();
    this.save();
  }
}
