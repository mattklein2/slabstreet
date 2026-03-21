-- Add unique constraint on box_configurations for upsert support
ALTER TABLE box_configurations
  ADD CONSTRAINT box_configurations_product_id_config_type_key
  UNIQUE (product_id, config_type);
