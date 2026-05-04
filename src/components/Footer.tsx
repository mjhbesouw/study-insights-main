interface FooterProps {
  containerClass?: string;
}

const Footer = ({ containerClass = "study-container" }: FooterProps) => (
    <footer className="border-t border-border py-6">
        <div className={containerClass}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                <div>
                    <p>Catharina Ziekenhuis Eindhoven</p>
                    <p>Afdeling Radiotherapie</p>
                </div>
                <div className="text-center sm:text-right">
                    <p>Contact: marlie.besouw@catharinaziekenhuis.nl</p>
                    <p>Project: Multicenter-DLS-2026</p>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
