export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Eventli, Inc. All rights reserved.
        </div>
    </footer>
  )
}