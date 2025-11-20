import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  addEthicalConfig,
  getEthicalConfigs,
  updateEthicalConfig,
  deleteEthicalConfig,
} from '../../src/services/inMemoryStore';

describe('In-Memory Store', () => {
  beforeEach(() => {
    // Clear store before each test
    const configs = getEthicalConfigs();
    configs.forEach((config) => deleteEthicalConfig(config.id));
  });

  describe('Ethical Configs', () => {
    it('should add a new ethical config', () => {
      const config = {
        name: 'Test Config',
        description: 'Test description',
        rules: ['rule1', 'rule2'],
        isActive: true,
      };

      const added = addEthicalConfig(config);

      expect(added).toHaveProperty('id');
      expect(added.name).toBe(config.name);
      expect(added.rules).toEqual(config.rules);
    });

    it('should retrieve all ethical configs', () => {
      addEthicalConfig({
        name: 'Config 1',
        description: 'Description 1',
        rules: ['rule1'],
        isActive: true,
      });
      addEthicalConfig({
        name: 'Config 2',
        description: 'Description 2',
        rules: ['rule2'],
        isActive: false,
      });

      const configs = getEthicalConfigs();

      expect(configs).toHaveLength(2);
      expect(configs[0].name).toBe('Config 1');
      expect(configs[1].name).toBe('Config 2');
    });

    it('should update an existing ethical config', () => {
      const config = addEthicalConfig({
        name: 'Original',
        description: 'Original description',
        rules: ['rule1'],
        isActive: true,
      });

      const updated = updateEthicalConfig(config.id, {
        name: 'Updated',
        rules: ['rule1', 'rule2'],
      });

      expect(updated?.name).toBe('Updated');
      expect(updated?.rules).toEqual(['rule1', 'rule2']);
      expect(updated?.description).toBe('Original description');
    });

    it('should return null when updating non-existent config', () => {
      const updated = updateEthicalConfig('non-existent-id', {
        name: 'Updated',
      });

      expect(updated).toBeNull();
    });

    it('should delete an ethical config', () => {
      const config = addEthicalConfig({
        name: 'To Delete',
        description: 'Will be deleted',
        rules: [],
        isActive: true,
      });

      const deleted = deleteEthicalConfig(config.id);
      const configs = getEthicalConfigs();

      expect(deleted).toBe(true);
      expect(configs).toHaveLength(0);
    });

    it('should return false when deleting non-existent config', () => {
      const deleted = deleteEthicalConfig('non-existent-id');

      expect(deleted).toBe(false);
    });

    it('should handle multiple operations', () => {
      const config1 = addEthicalConfig({
        name: 'Config 1',
        description: 'Description 1',
        rules: ['rule1'],
        isActive: true,
      });
      const config2 = addEthicalConfig({
        name: 'Config 2',
        description: 'Description 2',
        rules: ['rule2'],
        isActive: false,
      });

      updateEthicalConfig(config1.id, { isActive: false });
      deleteEthicalConfig(config2.id);

      const configs = getEthicalConfigs();

      expect(configs).toHaveLength(1);
      expect(configs[0].id).toBe(config1.id);
      expect(configs[0].isActive).toBe(false);
    });
  });
});
