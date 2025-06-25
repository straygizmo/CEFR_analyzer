import { test, expect, Page, Browser } from '@playwright/test';
import { testSamples } from './test-samples';
import * as fs from 'fs/promises';
import * as path from 'path';

interface CVLAResult {
  estimatedLevel: string;
  levelDistribution: {
    A1: number;
    A2: number;
    B1: number;
    B2: number;
    C1: number;
    C2: number;
    NA: number;
  };
  metrics: {
    AvrDiff: number;
    BperA: number;
    CVV1: number;
    AvrFreqRank: number;
    ARI: number;
    VperSent: number;
    POStypes: number;
    LenNP: number;
  };
  coloredText?: string;
}

interface ComparisonResult {
  sampleId: number;
  wordCount: number;
  text: string;
  cvlaResult: CVLAResult;
  ourResult: CVLAResult;
  levelMatch: boolean;
  metricsDifferences: {
    [key: string]: {
      cvla: number;
      ours: number;
      difference: number;
      percentageDiff: number;
    };
  };
}

// Helper function to scrape CVLA results
async function scrapeCVLAResults(page: Page, text: string): Promise<CVLAResult> {
  await page.goto('https://cvla.langedu.jp/', { waitUntil: 'networkidle' });
  
  // Input text
  await page.fill('textarea[name="inputText"]', text);
  
  // Submit form
  await page.click('input[type="submit"][value="Analyze"]');
  
  // Wait for results with longer timeout
  await page.waitForSelector('div.results', { timeout: 60000 });
  
  // Extract estimated level
  const levelElement = await page.locator('div.results p').first();
  const levelText = await levelElement.textContent() || '';
  const levelMatch = levelText.match(/Estimated CEFR-J Level:\s*([A-C][12](?:\.[12])?)/);
  const estimatedLevel = levelMatch ? levelMatch[1] : 'Unknown';
  
  // Extract metrics from the table
  const metrics: CVLAResult['metrics'] = {
    AvrDiff: 0,
    BperA: 0,
    CVV1: 0,
    AvrFreqRank: 0,
    ARI: 0,
    VperSent: 0,
    POStypes: 0,
    LenNP: 0,
  };
  
  // Find the metrics table
  const tables = await page.locator('table').all();
  for (const table of tables) {
    const headers = await table.locator('th').all();
    let isMetricsTable = false;
    
    for (const header of headers) {
      const headerText = await header.textContent();
      if (headerText?.includes('AvrDiff')) {
        isMetricsTable = true;
        break;
      }
    }
    
    if (isMetricsTable) {
      // Get the data row (should be the third row)
      const dataRow = await table.locator('tr').nth(2);
      const cells = await dataRow.locator('td').all();
      
      if (cells.length >= 9) {
        metrics.AvrDiff = parseFloat(await cells[1].textContent() || '0');
        metrics.BperA = parseFloat(await cells[2].textContent() || '0');
        metrics.CVV1 = parseFloat(await cells[3].textContent() || '0');
        metrics.AvrFreqRank = parseFloat(await cells[4].textContent() || '0');
        metrics.ARI = parseFloat(await cells[5].textContent() || '0');
        metrics.VperSent = parseFloat(await cells[6].textContent() || '0');
        metrics.POStypes = parseFloat(await cells[7].textContent() || '0');
        metrics.LenNP = parseFloat(await cells[8].textContent() || '0');
      }
      break;
    }
  }
  
  // Extract level distribution (if available)
  const levelDistribution: CVLAResult['levelDistribution'] = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
    NA: 0,
  };
  
  // Try to extract colored text HTML
  const coloredTextElement = await page.locator('div.results > div').nth(1);
  const coloredText = await coloredTextElement.innerHTML().catch(() => '');
  
  return { estimatedLevel, levelDistribution, metrics, coloredText };
}

// Helper function to get results from our VocabularyAnalyzer
async function getOurAnalyzerResults(page: Page, text: string): Promise<CVLAResult> {
  await page.goto('/', { waitUntil: 'networkidle' });
  
  // Navigate to vocabulary analyzer
  await page.click('a[href="/vocabulary"]');
  await page.waitForLoadState('networkidle');
  
  // Input text
  await page.fill('textarea[placeholder*="Enter your text"]', text);
  
  // Analyze
  await page.click('button:has-text("Analyze")');
  
  // Wait for results
  await page.waitForSelector('h3:has-text("Estimated CEFR-J Level:")', { timeout: 15000 });
  
  // Extract estimated level
  const levelText = await page.locator('h3:has-text("Estimated CEFR-J Level:")').textContent() || '';
  const estimatedLevel = levelText.replace('Estimated CEFR-J Level: ', '').trim();
  
  // Extract metrics from the table
  const metrics: CVLAResult['metrics'] = {
    AvrDiff: 0,
    BperA: 0,
    CVV1: 0,
    AvrFreqRank: 0,
    ARI: 0,
    VperSent: 0,
    POStypes: 0,
    LenNP: 0,
  };
  
  const dataRow = await page.locator('table tr').nth(2);
  const cells = await dataRow.locator('td').all();
  
  if (cells.length >= 9) {
    metrics.AvrDiff = parseFloat(await cells[1].textContent() || '0');
    metrics.BperA = parseFloat(await cells[2].textContent() || '0');
    metrics.CVV1 = parseFloat(await cells[3].textContent() || '0');
    metrics.AvrFreqRank = parseFloat(await cells[4].textContent() || '0');
    metrics.ARI = parseFloat(await cells[5].textContent() || '0');
    metrics.VperSent = parseFloat(await cells[6].textContent() || '0');
    metrics.POStypes = parseFloat(await cells[7].textContent() || '0');
    metrics.LenNP = parseFloat(await cells[8].textContent() || '0');
  }
  
  // Get colored text HTML
  const coloredTextElement = await page.locator('div.p-4.bg-gray-50.border.rounded-lg').first();
  const coloredText = await coloredTextElement.innerHTML().catch(() => '');
  
  const levelDistribution: CVLAResult['levelDistribution'] = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
    NA: 0,
  };
  
  return { estimatedLevel, levelDistribution, metrics, coloredText };
}

// Generate HTML report
function generateHTMLReport(results: ComparisonResult[]): string {
  const timestamp = new Date().toISOString();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CVLA Comparison Report - ${timestamp}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #333;
        }
        .summary {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .sample {
            border: 1px solid #ddd;
            margin-bottom: 30px;
            padding: 15px;
            border-radius: 5px;
        }
        .match {
            color: green;
            font-weight: bold;
        }
        .mismatch {
            color: red;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .text-preview {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 3px;
            margin: 10px 0;
            max-height: 100px;
            overflow-y: auto;
        }
        .metric-diff {
            font-size: 0.9em;
            color: #666;
        }
        .high-diff {
            background-color: #ffebee;
        }
        .colored-text {
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #e0e0e0;
            border-radius: 3px;
            background-color: #fafafa;
        }
        .legend {
            font-size: 0.9em;
            margin: 10px 0;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>CEFR-J Vocabulary Analyzer Comparison Report</h1>
        <p>Generated: ${timestamp}</p>
        
        <div class="summary">
            <h2>Summary</h2>
            <p>Total samples tested: ${results.length}</p>
            <p>Level matches: ${results.filter(r => r.levelMatch).length} / ${results.length} (${(results.filter(r => r.levelMatch).length / results.length * 100).toFixed(1)}%)</p>
        </div>
        
        ${results.map(result => `
        <div class="sample">
            <h3>Sample ${result.sampleId} (${result.wordCount} words)</h3>
            
            <div class="text-preview">
                <strong>Text:</strong> ${result.text.substring(0, 200)}${result.text.length > 200 ? '...' : ''}
            </div>
            
            <h4>Level Comparison</h4>
            <table>
                <tr>
                    <th>Source</th>
                    <th>Estimated Level</th>
                    <th>Match</th>
                </tr>
                <tr>
                    <td>CVLA (cvla.langedu.jp)</td>
                    <td>${result.cvlaResult.estimatedLevel}</td>
                    <td rowspan="2" class="${result.levelMatch ? 'match' : 'mismatch'}">
                        ${result.levelMatch ? '✓ Match' : '✗ Mismatch'}
                    </td>
                </tr>
                <tr>
                    <td>Our Analyzer</td>
                    <td>${result.ourResult.estimatedLevel}</td>
                </tr>
            </table>
            
            <h4>Metrics Comparison</h4>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>CVLA</th>
                    <th>Our Analyzer</th>
                    <th>Difference</th>
                    <th>% Difference</th>
                </tr>
                ${Object.entries(result.metricsDifferences).map(([metric, diff]) => `
                <tr class="${Math.abs(diff.percentageDiff) > 10 ? 'high-diff' : ''}">
                    <td>${metric}</td>
                    <td>${diff.cvla.toFixed(2)}</td>
                    <td>${diff.ours.toFixed(2)}</td>
                    <td>${diff.difference > 0 ? '+' : ''}${diff.difference.toFixed(2)}</td>
                    <td>${diff.percentageDiff > 0 ? '+' : ''}${diff.percentageDiff.toFixed(1)}%</td>
                </tr>
                `).join('')}
            </table>
            
            ${result.cvlaResult.coloredText || result.ourResult.coloredText ? `
            <h4>Colored Text Comparison</h4>
            <div class="legend">
                <strong>Legend:</strong><br>
                A1: <span style="color: #32cd32">A1 Level Word</span>,
                A2: <span style="color: #32cd32; font-weight: bold">A2 Level Word</span>,
                B1: <span style="color: blue">B1 Level Word</span>,
                B2: <span style="color: blue; font-weight: bold">B2 Level Word</span>,
                C1: <span style="color: red">C1 Level Word</span>,
                C2: <span style="color: red; font-weight: bold">C2 Level Word</span>,
                NA content words: <span style="color: orange">Other Content Word</span>
            </div>
            ${result.cvlaResult.coloredText ? `
            <div class="colored-text">
                <strong>CVLA Colored Text:</strong><br>
                ${result.cvlaResult.coloredText}
            </div>
            ` : ''}
            ${result.ourResult.coloredText ? `
            <div class="colored-text">
                <strong>Our Analyzer Colored Text:</strong><br>
                ${result.ourResult.coloredText}
            </div>
            ` : ''}
            ` : ''}
        </div>
        `).join('')}
    </div>
</body>
</html>
  `;
  
  return html;
}

test.describe('CVLA Quick Comparison', () => {
  test('Compare first 3 samples with cvla.langedu.jp', async ({ browser }) => {
    const results: ComparisonResult[] = [];
    
    // Create two browser contexts - one for CVLA, one for our app
    const cvlaContext = await browser.newContext();
    const ourContext = await browser.newContext();
    
    const cvlaPage = await cvlaContext.newPage();
    const ourPage = await ourContext.newPage();
    
    // Test only first 3 samples for quick test
    const samplesToTest = testSamples.slice(0, 3);
    
    for (const sample of samplesToTest) {
      console.log(`Testing Sample ${sample.id} (${sample.wordCount} words)...`);
      
      try {
        // Get CVLA results
        const cvlaResult = await scrapeCVLAResults(cvlaPage, sample.text);
        console.log(`CVLA Result for Sample ${sample.id}:`, cvlaResult.estimatedLevel);
        
        // Get our analyzer results
        const ourResult = await getOurAnalyzerResults(ourPage, sample.text);
        console.log(`Our Result for Sample ${sample.id}:`, ourResult.estimatedLevel);
        
        // Calculate differences
        const metricsDifferences: ComparisonResult['metricsDifferences'] = {};
        
        for (const [key, cvlaValue] of Object.entries(cvlaResult.metrics)) {
          const ourValue = ourResult.metrics[key as keyof typeof ourResult.metrics];
          const difference = ourValue - cvlaValue;
          const percentageDiff = cvlaValue !== 0 ? (difference / cvlaValue) * 100 : 0;
          
          metricsDifferences[key] = {
            cvla: cvlaValue,
            ours: ourValue,
            difference,
            percentageDiff
          };
        }
        
        results.push({
          sampleId: sample.id,
          wordCount: sample.wordCount,
          text: sample.text,
          cvlaResult,
          ourResult,
          levelMatch: cvlaResult.estimatedLevel === ourResult.estimatedLevel,
          metricsDifferences
        });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error testing Sample ${sample.id}:`, error);
      }
    }
    
    // Generate HTML report
    const htmlReport = generateHTMLReport(results);
    const reportPath = path.join(process.cwd(), 'test-results', 'cvla-comparison-quick-report.html');
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    
    // Write report
    await fs.writeFile(reportPath, htmlReport, 'utf-8');
    console.log(`Comparison report saved to: ${reportPath}`);
    
    // Clean up
    await cvlaContext.close();
    await ourContext.close();
    
    // Basic assertions
    expect(results.length).toBeGreaterThan(0);
    
    // Log summary
    const matchCount = results.filter(r => r.levelMatch).length;
    console.log(`\nSummary: ${matchCount}/${results.length} level matches (${(matchCount/results.length*100).toFixed(1)}%)`);
  });
});