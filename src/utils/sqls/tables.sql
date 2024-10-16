-- Create product_details table
CREATE TABLE product_details (
    ProductCode VARCHAR(50) PRIMARY KEY,
    ProductName VARCHAR(100)
);

-- Create segment_details table
CREATE TABLE segment_details (
    SegmentId SERIAL PRIMARY KEY,
    SegmentName VARCHAR(100)
);

-- Create product_segment table
CREATE TABLE product_segment (
    PrimaryKey SERIAL PRIMARY KEY,
    ProductCode VARCHAR(50),
    SegmentName VARCHAR(100),
    ActiveFlag VARCHAR(1), -- Assuming ActiveFlag is either 'Y' or 'N'
    FOREIGN KEY (ProductCode) REFERENCES product_details(ProductCode),
    FOREIGN KEY (SegmentName) REFERENCES segment_details(SegmentName)
);

-- Create template_details table
CREATE TABLE template_details (
    ProductCode VARCHAR(50),
    TemplateId VARCHAR(50),
    ScoreId VARCHAR(50),
    FOREIGN KEY (ProductCode) REFERENCES product_details(ProductCode)
);

-- Create a view to combine data from product_details, segment_details, and product_segment
CREATE VIEW product_segment_view AS
SELECT 
    p.ProductCode,
    p.ProductName,
    s.SegmentId AS SegmentCode,
    s.SegmentName,
    ps.ActiveFlag
FROM 
    product_details p
JOIN 
    product_segment ps ON p.ProductCode = ps.ProductCode
JOIN 
    segment_details s ON ps.SegmentName = s.SegmentName;
