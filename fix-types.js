const fs = require('fs');

// 1. Fix Button asChild -> Link with buttonVariants in multiple files
const linkButtonReplacements = [
  {
    file: 'src/app/dashboard/purchases/page.tsx',
    replacements: [
      {
        from: /<Button asChild>\s*<Link href="([^"]+)">/g,
        to: '<Link href="$1" className={buttonVariants({ variant: "default" })}>'
      },
      {
        from: /<\/Link>\s*<\/Button>/g,
        to: '</Link>'
      },
      {
        from: /<Button variant="ghost" size="icon" asChild>\s*<Link href="([^"]+)">/g,
        to: '<Link href="$1" className={buttonVariants({ variant: "ghost", size: "icon" })}>'
      }
    ]
  },
  {
    file: 'src/app/dashboard/sales/page.tsx',
    replacements: [
      {
        from: /<Button asChild>\s*<Link href="([^"]+)">/g,
        to: '<Link href="$1" className={buttonVariants({ variant: "default" })}>'
      },
      {
        from: /<\/Link>\s*<\/Button>/g,
        to: '</Link>'
      },
      {
        from: /<Button variant="ghost" size="icon" asChild>\s*<Link href="([^"]+)">/g,
        to: '<Link href="$1" className={buttonVariants({ variant: "ghost", size: "icon" })}>'
      },
      {
        from: /<Button variant="ghost" size="icon" asChild title="([^"]+)">\s*<Link href="([^"]+)">/g,
        to: '<Link href="$2" title="$1" className={buttonVariants({ variant: "ghost", size: "icon" })}>'
      }
    ]
  },
  {
    file: 'src/app/dashboard/sales/[id]/invoice/page.tsx',
    replacements: [
      {
        from: /<Button variant="ghost" asChild>\s*<Link href="([^"]+)">/g,
        to: '<Link href="$1" className={buttonVariants({ variant: "ghost" })}>'
      },
      {
        from: /<\/Link>\s*<\/Button>/g,
        to: '</Link>'
      },
      {
        from: /onClick="window.print\(\)"/g,
        to: 'onClick={() => window.print()}'
      },
      {
        from: /export default async function InvoicePage\({ params }: { params: { id: string } }\) {/g,
        to: 'import { buttonVariants } from "@/components/ui/button";\\nexport default async function InvoicePage({ params }: { params: { id: string } }) {'
      }
    ]
  }
];

linkButtonReplacements.forEach(task => {
  if (fs.existsSync(task.file)) {
    let content = fs.readFileSync(task.file, 'utf8');
    
    // Add buttonVariants import if replacing with buttonVariants
    if (content.includes('<Button ') || content.includes('<Button>')) {
      if (!content.includes('buttonVariants')) {
        content = content.replace(/import { Button } from ["']@\/components\/ui\/button["'];?/, 'import { Button, buttonVariants } from "@/components/ui/button";');
      }
    }
    
    task.replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    fs.writeFileSync(task.file, content);
    console.log('Fixed:', task.file);
  }
});

// 2. Fix DropdownMenu in header.tsx
let headerPath = 'src/components/layout/header.tsx';
if (fs.existsSync(headerPath)) {
  let content = fs.readFileSync(headerPath, 'utf8');
  content = content.replace(/<DropdownMenuTrigger asChild>/g, '<DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>');
  content = content.replace(/<Button variant="ghost" className="relative h-8 w-8 rounded-full">\s*(<div[^>]*>[\s\S]*?<\/div>)\s*<\/Button>/, '$1');
  content = content.replace(/ forceMount>/g, '>');
  fs.writeFileSync(headerPath, content);
  console.log('Fixed header.tsx');
}

// 3. Fix multiple attributes in reports page
let reportsPath = 'src/app/dashboard/reports/page.tsx';
if (fs.existsSync(reportsPath)) {
  let content = fs.readFileSync(reportsPath, 'utf8');
  // It says multiple attributes with same name at line 120
  // Let's remove duplicate className or something.
  // We'll run a quick regex to deduplicate className
  // e.g. className="w-[150px]" className="text-right"
  content = content.replace(/className="([^"]+)"\s+className="([^"]+)"/g, 'className="$1 $2"');
  fs.writeFileSync(reportsPath, content);
  console.log('Fixed reports/page.tsx');
}

// 4. Fix getSaleById types in transaction-actions.ts
let actionsPath = 'src/app/actions/transaction-actions.ts';
if (fs.existsSync(actionsPath)) {
  let content = fs.readFileSync(actionsPath, 'utf8');
  content = content.replace(/const sale = saleRows\[0\];/g, 'const sale = saleRows[0] as any;');
  fs.writeFileSync(actionsPath, content);
  console.log('Fixed transaction-actions.ts');
}

