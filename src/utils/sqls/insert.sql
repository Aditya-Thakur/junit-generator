-- Insert data into product_details table
INSERT INTO product_details (ProductCode, ProductName)
VALUES ('TD', 'Titanium');

-- Insert data into segment_details table
INSERT INTO segment_details (SegmentName)
VALUES 
    ('BIENESRAICES'),
    ('DIRECCIONES'),
    ('GENERAL'),
    ('ACTIVIDAD_ECONOMICA'),
    ('DETALLE_PROTESTOS_MOROSIDAD'),
    ('CONTACTO_EMPRESA'),
    ('MOROSIDADES_BIC_MAPPING'),
    ('ONP_MAPPING'),
    ('CONSULTAS_RUTMAPPING'),
    ('QUIEBRAS'),
    ('REGULATED_DATA'),
    ('SOCIOSOCIĘDADES'),
    ('SUMMARY'),
    ('TELEFONO'),
    ('VEHICOLOS'),
    ('PRE_CALCULATED_ATTRIBUTES'),
    ('PRE_CALCULATED_ATTRIBUTES_REGULATED'),
    ('PRE_CALCULATED_ATTRIBUTES_NONREGULATED');

-- Insert data into product_segment table
INSERT INTO product_segment (ProductCode, SegmentName, ActiveFlag)
VALUES 
    ('TD', 'BIENESRAICES', 'Y'),
    ('TD', 'DIRECCIONES', 'Y'),
    ('TD', 'GENERAL', 'Y'),
    ('TD', 'ACTIVIDAD_ECONOMICA', 'Y'),
    ('TD', 'DETALLE_PROTESTOS_MOROSIDAD', 'Y'),
    ('TD', 'CONTACTO_EMPRESA', 'Y'),
    ('TD', 'MOROSIDADES_BIC_MAPPING', 'Y'),
    ('TD', 'ONP_MAPPING', 'Y'),
    ('TD', 'CONSULTAS_RUTMAPPING', 'Y'),
    ('TD', 'QUIEBRAS', 'Y'),
    ('TD', 'REGULATED_DATA', 'Y'),
    ('TD', 'SOCIOSOCIĘDADES', 'Y'),
    ('TD', 'SUMMARY', 'Y'),
    ('TD', 'TELEFONO', 'Y'),
    ('TD', 'VEHICOLOS', 'Y'),
    ('TD', 'PRE_CALCULATED_ATTRIBUTES', 'Y'),
    ('TD', 'PRE_CALCULATED_ATTRIBUTES_REGULATED', 'Y'),
    ('TD', 'PRE_CALCULATED_ATTRIBUTES_NONREGULATED', 'Y');

-- Insert data into template_details table
INSERT INTO template_details (ProductCode, TemplateId, ScoreId)
VALUES 
    ('TD', '3547303647', ''),
    ('TD', 'CLCV', '');
