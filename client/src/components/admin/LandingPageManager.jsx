import TestimonialsManager from "./TestimonialsManager";
import AdminStatsEditor from "./AdminStatsEditor";

export default function LandingPageManager() {
    return (
        <div className="space-y-10">
            <div>
                <AdminStatsEditor />
            </div>

            <div>
                <TestimonialsManager />
            </div>
        </div>
    );
}
