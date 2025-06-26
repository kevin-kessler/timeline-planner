export class EntityNotFoundError extends Error {
    constructor(entityType: string, id: string) {
        super(`${entityType} not found: ${id}`);
        this.name = 'EntityNotFoundError';
    }
}
