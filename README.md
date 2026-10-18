# Student Finance Tracker

The theme of this assingment is to create a student Finance Tracker

Demo Video : 
Author: Bemnet Tenketem ( also known as bgebremich, email b.gebremich@alueducation.com)

What it does:
- Each transaction is going to be stored as one object and they are all going to be kept in an array in storage created called localstorage.

The settings are stored separetly: this is; base currency, manual EU and RWF rates, as well as the spending cap. Because it's obviousy tied to the settings

Page Layout : 
- There is the title, called Student Finance Tracker, follwed by 5 options ; About, Dashboard, Records, Add/Edit Settings. 

After that there is the footer at the end. 

On Phones everything stacks in one column and the table scrolls sideways. At 768px the stat cards and search controls sit in rows, and at 1024px the form uses two columns.

Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`, with one `h1` and `h2` per section
- Skip link as the first focusable element
- Every input has a bound `<label>`, and errors are linked with `aria-describedby`
- Visible `:focus-visible` outline on all interactive elements
- Status, error and cap messages use `role="status"` or `aria-live` (polite under the cap, assertive over it)
- Edit and Delete buttons carry the record name in their `aria-label`
- Colors chosen for readable contrast; animations switch off for `prefers-reduced-motion`
- Everything works with the keyboard. 

Features
Add, edit and delete transactions, with inline validation messages
- Sort by date, description or amount
- Live regex search with a case-insensitive toggle and highlighted matches
- Dashboard: total records, total spent, top category, 7-day chart
- Spending cap with a polite or assertive live message
- Currency settings (USD, EUR, RWF) with manual rates
- Auto-save to localStorage; JSON import (validated) and export

