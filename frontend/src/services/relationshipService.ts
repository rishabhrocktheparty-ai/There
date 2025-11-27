import axios from 'axios';
import {
  Relationship,
  CreateRelationshipRequest,
  UpdateRelationshipRequest,
  RelationshipFilter,
} from '../types/relationship';

class RelationshipService {
  /**
   * Get all relationships for the current user
   */
  async getRelationships(filter?: RelationshipFilter): Promise<Relationship[]> {
    const params: any = {};
    
    if (filter?.status && filter.status !== 'all') {
      params.status = filter.status;
    }
    if (filter?.roleType) {
      params.roleType = filter.roleType;
    }
    if (filter?.searchTerm) {
      params.search = filter.searchTerm;
    }
    if (filter?.sortBy) {
      params.sortBy = filter.sortBy;
    }

    const response = await axios.get('/api/relationships', { params });
    return response.data;
  }

  /**
   * Get a single relationship by ID
   */
  async getRelationship(id: string): Promise<Relationship> {
    const response = await axios.get(`/api/relationships/${id}`);
    return response.data;
  }

  /**
   * Create a new relationship
   */
  async createRelationship(request: CreateRelationshipRequest): Promise<Relationship> {
    const response = await axios.post('/api/relationships', request);
    return response.data;
  }

  /**
   * Update relationship customization or status
   */
  async updateRelationship(
    id: string,
    request: UpdateRelationshipRequest
  ): Promise<Relationship> {
    const response = await axios.patch(`/api/relationships/${id}`, request);
    return response.data;
  }

  /**
   * Delete a relationship
   */
  async deleteRelationship(id: string): Promise<void> {
    await axios.delete(`/api/relationships/${id}`);
  }

  /**
   * Get relationship statistics
   */
  async getRelationshipStats(id: string): Promise<any> {
    const response = await axios.get(`/api/relationships/${id}/stats`);
    return response.data;
  }

  /**
   * Get conversation history for a relationship
   */
  async getConversationHistory(
    id: string,
    limit = 50,
    offset = 0
  ): Promise<any[]> {
    const response = await axios.get(`/api/relationships/${id}/history`, {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Archive a relationship
   */
  async archiveRelationship(id: string): Promise<Relationship> {
    return this.updateRelationship(id, { status: 'archived' });
  }

  /**
   * Pause a relationship
   */
  async pauseRelationship(id: string): Promise<Relationship> {
    return this.updateRelationship(id, { status: 'paused' });
  }

  /**
   * Resume a relationship
   */
  async resumeRelationship(id: string): Promise<Relationship> {
    return this.updateRelationship(id, { status: 'active' });
  }

  /**
   * Get active relationships count
   */
  async getActiveCount(): Promise<number> {
    const relationships = await this.getRelationships({ status: 'active' });
    return relationships.length;
  }

  /**
   * Search relationships
   */
  async searchRelationships(query: string): Promise<Relationship[]> {
    const response = await axios.get('/api/relationships/search', {
      params: { q: query },
    });
    return response.data;
  }

  /**
   * Export relationship data
   */
  async exportRelationship(id: string): Promise<Blob> {
    const response = await axios.get(`/api/relationships/${id}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const relationshipService = new RelationshipService();
