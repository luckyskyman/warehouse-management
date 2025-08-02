import type { 
  User, InsertUser, 
  InventoryItem, InsertInventoryItem,
  Transaction, InsertTransaction,
  BomGuide, InsertBomGuide,
  WarehouseLayout, InsertWarehouseLayout,
  ExchangeQueue, InsertExchangeQueue,
  WorkDiary, InsertWorkDiary,
  WorkDiaryComment, InsertWorkDiaryComment,
  WorkNotification, InsertWorkNotification
} from "@shared/schema";

export class MemStorage {
  private users = new Map<number, User>();
  private inventoryItems = new Map<number, InventoryItem>();
  private transactions = new Map<number, Transaction>();
  private bomGuides = new Map<number, BomGuide>();
  private warehouseLayout = new Map<number, WarehouseLayout>();
  private exchangeQueue = new Map<number, ExchangeQueue>();
  private workDiary = new Map<number, WorkDiary>();
  private workDiaryComments = new Map<number, WorkDiaryComment>();
  private workNotifications = new Map<number, WorkNotification>();

  private nextUserId = 1;
  private nextInventoryId = 1;
  private nextTransactionId = 1;
  private nextBomId = 1;
  private nextWarehouseId = 1;
  private nextExchangeId = 1;
  private nextWorkDiaryId = 1;
  private nextCommentId = 1;
  private nextNotificationId = 1;

  constructor() {
    // Initialize with admin and viewer users
    this.createUser({
      username: "admin",
      password: "xormr",
      role: "admin",
      department: "관리부",
      position: "관리자",
      isManager: true,
      canUploadBom: true,
      canUploadMaster: true,
      canUploadInventoryAdd: true,
      canUploadInventorySync: true,
      canAccessExcelManagement: true,
      canBackupData: true,
      canRestoreData: true,
      canResetData: true,
      canManageUsers: true,
      canManagePermissions: true,
      canDownloadInventory: true,
      canDownloadTransactions: true,
      canDownloadBom: true,
      canDownloadAll: true,
      canManageInventory: true,
      canProcessTransactions: true,
      canManageBom: true,
      canManageWarehouse: true,
      canProcessExchange: true,
      canManageLocation: true,
      canCreateDiary: true,
      canEditDiary: true,
      canDeleteDiary: true,
      canViewReports: true
    });

    this.createUser({
      username: "viewer",
      password: "viewer123",
      role: "viewer",
      department: "일반부",
      position: "사원",
      isManager: false,
      canUploadBom: false,
      canUploadMaster: false,
      canUploadInventoryAdd: false,
      canUploadInventorySync: false,
      canAccessExcelManagement: false,
      canBackupData: false,
      canRestoreData: false,
      canResetData: false,
      canManageUsers: false,
      canManagePermissions: false,
      canDownloadInventory: true,
      canDownloadTransactions: false,
      canDownloadBom: true,
      canDownloadAll: false,
      canManageInventory: false,
      canProcessTransactions: false,
      canManageBom: false,
      canManageWarehouse: false,
      canProcessExchange: false,
      canManageLocation: false,
      canCreateDiary: true,
      canEditDiary: true,
      canDeleteDiary: false,
      canViewReports: true
    });

    // Initialize with sample inventory items
    this.createInventoryItem({
      code: "ITEM001",
      name: "샘플 아이템 1",
      category: "전자부품",
      manufacturer: "삼성",
      stock: 100,
      minStock: 10,
      unit: "ea",
      location: "A-1-01",
      boxSize: 50
    });

    this.createInventoryItem({
      code: "ITEM002", 
      name: "샘플 아이템 2",
      category: "기계부품",
      manufacturer: "LG",
      stock: 50,
      minStock: 5,
      unit: "ea",
      location: "B-2-03",
      boxSize: 25
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      username: userData.username,
      password: userData.password,
      role: userData.role || "viewer",
      department: userData.department || null,
      position: userData.position || null,
      isManager: userData.isManager || false,
      canUploadBom: userData.canUploadBom || false,
      canUploadMaster: userData.canUploadMaster || false,
      canUploadInventoryAdd: userData.canUploadInventoryAdd || false,
      canUploadInventorySync: userData.canUploadInventorySync || false,
      canAccessExcelManagement: userData.canAccessExcelManagement || false,
      canBackupData: userData.canBackupData || false,
      canRestoreData: userData.canRestoreData || false,
      canResetData: userData.canResetData || false,
      canManageUsers: userData.canManageUsers || false,
      canManagePermissions: userData.canManagePermissions || false,
      canDownloadInventory: userData.canDownloadInventory || true,
      canDownloadTransactions: userData.canDownloadTransactions || false,
      canDownloadBom: userData.canDownloadBom || true,
      canDownloadAll: userData.canDownloadAll || false,
      canManageInventory: userData.canManageInventory || false,
      canProcessTransactions: userData.canProcessTransactions || false,
      canManageBom: userData.canManageBom || false,
      canManageWarehouse: userData.canManageWarehouse || false,
      canProcessExchange: userData.canProcessExchange || false,
      canManageLocation: userData.canManageLocation || false,
      canCreateDiary: userData.canCreateDiary || true,
      canEditDiary: userData.canEditDiary || true,
      canDeleteDiary: userData.canDeleteDiary || false,
      canViewReports: userData.canViewReports || true,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Inventory management
  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItem(code: string): Promise<InventoryItem | undefined> {
    for (const item of this.inventoryItems.values()) {
      if (item.code === code) {
        return item;
      }
    }
    return undefined;
  }

  async getInventoryItemById(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(itemData: InsertInventoryItem): Promise<InventoryItem> {
    const item: InventoryItem = {
      id: this.nextInventoryId++,
      code: itemData.code,
      name: itemData.name,
      category: itemData.category,
      manufacturer: itemData.manufacturer || null,
      stock: itemData.stock || 0,
      minStock: itemData.minStock || 0,
      unit: itemData.unit || "ea",
      location: itemData.location || null,
      boxSize: itemData.boxSize || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.inventoryItems.set(item.id, item);
    return item;
  }

  async updateInventoryItem(code: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    for (const [id, item] of this.inventoryItems.entries()) {
      if (item.code === code) {
        const updatedItem = { ...item, ...updates, updatedAt: new Date() };
        this.inventoryItems.set(id, updatedItem);
        return updatedItem;
      }
    }
    return undefined;
  }

  async updateInventoryItemById(id: number, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates, updatedAt: new Date() };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(code: string): Promise<boolean> {
    for (const [id, item] of this.inventoryItems.entries()) {
      if (item.code === code) {
        return this.inventoryItems.delete(id);
      }
    }
    return false;
  }

  // Transaction management
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByItemCode(itemCode: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.itemCode === itemCode);
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      id: this.nextTransactionId++,
      type: transactionData.type,
      itemCode: transactionData.itemCode,
      itemName: transactionData.itemName,
      quantity: transactionData.quantity,
      fromLocation: transactionData.fromLocation || null,
      toLocation: transactionData.toLocation || null,
      reason: transactionData.reason || null,
      memo: transactionData.memo || null,
      userId: transactionData.userId || null,
      createdAt: new Date()
    };
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  // BOM management
  async getBomGuides(): Promise<BomGuide[]> {
    return Array.from(this.bomGuides.values());
  }

  async getBomGuidesByName(guideName: string): Promise<BomGuide[]> {
    return Array.from(this.bomGuides.values()).filter(b => b.guideName === guideName);
  }

  async createBomGuide(bomData: InsertBomGuide): Promise<BomGuide> {
    const bom: BomGuide = {
      id: this.nextBomId++,
      guideName: bomData.guideName,
      itemCode: bomData.itemCode,
      requiredQuantity: bomData.requiredQuantity,
      createdAt: new Date()
    };
    this.bomGuides.set(bom.id, bom);
    return bom;
  }

  async deleteBomGuidesByName(guideName: string): Promise<boolean> {
    let deleted = false;
    for (const [id, bom] of this.bomGuides.entries()) {
      if (bom.guideName === guideName) {
        this.bomGuides.delete(id);
        deleted = true;
      }
    }
    return deleted;
  }

  // Warehouse layout
  async getWarehouseLayout(): Promise<WarehouseLayout[]> {
    return Array.from(this.warehouseLayout.values());
  }

  async createWarehouseZone(layoutData: InsertWarehouseLayout): Promise<WarehouseLayout> {
    const zone: WarehouseLayout = {
      id: this.nextWarehouseId++,
      zoneName: layoutData.zoneName,
      subZoneName: layoutData.subZoneName,
      floors: layoutData.floors,
      createdAt: new Date()
    };
    this.warehouseLayout.set(zone.id, zone);
    return zone;
  }

  async updateWarehouseZone(id: number, updates: InsertWarehouseLayout): Promise<WarehouseLayout | undefined> {
    const zone = this.warehouseLayout.get(id);
    if (!zone) return undefined;
    
    const updatedZone = { ...zone, ...updates };
    this.warehouseLayout.set(id, updatedZone);
    return updatedZone;
  }

  async deleteWarehouseZone(id: number): Promise<boolean> {
    return this.warehouseLayout.delete(id);
  }

  // Exchange queue
  async getExchangeQueue(): Promise<ExchangeQueue[]> {
    return Array.from(this.exchangeQueue.values());
  }

  async createExchangeQueueItem(itemData: InsertExchangeQueue): Promise<ExchangeQueue> {
    const item: ExchangeQueue = {
      id: this.nextExchangeId++,
      itemCode: itemData.itemCode,
      itemName: itemData.itemName,
      quantity: itemData.quantity,
      outboundDate: itemData.outboundDate,
      processed: false,
      createdAt: new Date()
    };
    this.exchangeQueue.set(item.id, item);
    return item;
  }

  async processExchangeQueueItem(id: number): Promise<boolean> {
    const item = this.exchangeQueue.get(id);
    if (!item) return false;
    
    item.processed = true;
    return true;
  }

  // Work diary
  async getWorkDiaries(startDate?: Date, endDate?: Date): Promise<WorkDiary[]> {
    let diaries = Array.from(this.workDiary.values());
    
    if (startDate && endDate) {
      diaries = diaries.filter(d => d.workDate >= startDate && d.workDate <= endDate);
    }
    
    return diaries.sort((a, b) => b.workDate.getTime() - a.workDate.getTime());
  }

  async getWorkDiary(id: number): Promise<WorkDiary | undefined> {
    return this.workDiary.get(id);
  }

  async createWorkDiary(diaryData: InsertWorkDiary): Promise<WorkDiary> {
    const diary: WorkDiary = {
      id: this.nextWorkDiaryId++,
      title: diaryData.title,
      content: diaryData.content,
      category: diaryData.category,
      priority: diaryData.priority || "normal",
      status: diaryData.status || "completed",
      workDate: diaryData.workDate,
      attachments: diaryData.attachments || null,
      tags: diaryData.tags || null,
      authorId: diaryData.authorId,
      assignedTo: diaryData.assignedTo || null,
      visibility: diaryData.visibility || "department",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.workDiary.set(diary.id, diary);
    return diary;
  }

  async updateWorkDiary(id: number, updates: Partial<WorkDiary>): Promise<WorkDiary | undefined> {
    const diary = this.workDiary.get(id);
    if (!diary) return undefined;
    
    const updatedDiary = { ...diary, ...updates, updatedAt: new Date() };
    this.workDiary.set(id, updatedDiary);
    return updatedDiary;
  }

  async deleteWorkDiary(id: number): Promise<boolean> {
    return this.workDiary.delete(id);
  }

  // Work diary comments
  async getWorkDiaryComments(diaryId: number): Promise<WorkDiaryComment[]> {
    return Array.from(this.workDiaryComments.values()).filter(c => c.diaryId === diaryId);
  }

  async createWorkDiaryComment(commentData: InsertWorkDiaryComment): Promise<WorkDiaryComment> {
    const comment: WorkDiaryComment = {
      id: this.nextCommentId++,
      diaryId: commentData.diaryId,
      content: commentData.content,
      authorId: commentData.authorId,
      createdAt: new Date()
    };
    this.workDiaryComments.set(comment.id, comment);
    return comment;
  }

  async deleteWorkDiaryComment(id: number): Promise<boolean> {
    return this.workDiaryComments.delete(id);
  }

  // Work notifications
  async getWorkNotifications(userId: number): Promise<WorkNotification[]> {
    return Array.from(this.workNotifications.values()).filter(n => n.userId === userId);
  }

  async createWorkNotification(notificationData: InsertWorkNotification): Promise<WorkNotification> {
    const notification: WorkNotification = {
      id: this.nextNotificationId++,
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || "info",
      read: false,
      createdAt: new Date()
    };
    this.workNotifications.set(notification.id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.workNotifications.get(id);
    if (!notification) return false;
    
    notification.read = true;
    return true;
  }
}
