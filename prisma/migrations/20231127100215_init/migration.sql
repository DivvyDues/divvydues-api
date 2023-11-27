-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payerId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "expenseSheetId" INTEGER NOT NULL,
    CONSTRAINT "Expense_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_expenseSheetId_fkey" FOREIGN KEY ("expenseSheetId") REFERENCES "ExpenseSheet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ExpenseSheet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_ExpenseBeneficiary" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ExpenseBeneficiary_A_fkey" FOREIGN KEY ("A") REFERENCES "Expense" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ExpenseBeneficiary_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ExpenseSheetMember" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ExpenseSheetMember_A_fkey" FOREIGN KEY ("A") REFERENCES "ExpenseSheet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ExpenseSheetMember_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ExpenseBeneficiary_AB_unique" ON "_ExpenseBeneficiary"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpenseBeneficiary_B_index" ON "_ExpenseBeneficiary"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExpenseSheetMember_AB_unique" ON "_ExpenseSheetMember"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpenseSheetMember_B_index" ON "_ExpenseSheetMember"("B");
