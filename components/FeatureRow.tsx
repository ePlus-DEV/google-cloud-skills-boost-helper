function FeatureRow({ label, content }: { label: string; content: JSX.Element }) {
    return (
        <tr>
            <td className="border px-4 py-2">{label}</td>
            <td className="border px-4 py-2">{content}</td>
        </tr>
    );
}

export default FeatureRow;