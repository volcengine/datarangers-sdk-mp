class Storage {
  constructor(public target: any) {}

  get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const value = this.target.getStorageSync(key);
        resolve(value);
      } catch (e) {
        reject(e);
      }
    });
  }

  set(key: string, value: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.target.setStorageSync(key, value);
        resolve(true);
      } catch (e) {
        reject(false);
      }
    });
  }

  remove(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.target.removeStorageSync(key);
        resolve(true);
      } catch (e) {
        reject(false);
      }
    });
  }
}

export default Storage;
