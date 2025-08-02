// 간단한 메모리 기반 스토리지 (데이터베이스 연결 문제 해결까지)
export class SimpleStorage {
  private users = new Map([
    ['admin', { id: 1, username: 'admin', password: 'xormr', role: 'admin', fullName: 'Administrator' }],
    ['viewer', { id: 2, username: 'viewer', password: 'viewer123', role: 'viewer', fullName: 'Viewer User' }]
  ]);

  async getUserByUsername(username: string) {
    return this.users.get(username) || null;
  }

  async getUserById(id: number) {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  // 다른 메서드들은 기본값 반환
  async getInventoryItems() { return []; }
  async getTransactions() { return []; }
  async getBomGuides() { return []; }
  async getWarehouseLayout() { return []; }
  async getUsers() { return Array.from(this.users.values()); }
  async getWorkDiaryEntries() { return []; }
  
  // 쓰기 작업은 성공으로 처리
  async createInventoryItem(item: any) { return { ...item, id: Date.now() }; }
  async updateInventoryItem(id: number, item: any) { return { ...item, id }; }
  async deleteInventoryItem(id: number) { return true; }
  
  async createTransaction(transaction: any) { return { ...transaction, id: Date.now() }; }
  async createBomGuide(guide: any) { return { ...guide, id: Date.now() }; }
  async createWarehouseLayout(layout: any) { return { ...layout, id: Date.now() }; }
  async createUser(user: any) { return { ...user, id: Date.now() }; }
  async createWorkDiaryEntry(entry: any) { return { ...entry, id: Date.now() }; }
}

export const simpleStorage = new SimpleStorage();
