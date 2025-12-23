import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { STREAM_MANAGER_ADDRESS, STREAM_MANAGER_ABI } from '@/lib/contract';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface StreamNFTCardProps {
    streamId: bigint;
}

interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
}

export function StreamNFTCard({ streamId }: StreamNFTCardProps) {
    const [metadata, setMetadata] = useState<NFTMetadata | null>(null);

    const { data: tokenUri, isLoading, isError } = useReadContract({
        address: STREAM_MANAGER_ADDRESS,
        abi: STREAM_MANAGER_ABI,
        functionName: 'tokenURI',
        args: [streamId],
    });

    useEffect(() => {
        if (tokenUri && typeof tokenUri === 'string') {
            try {
                const jsonPart = tokenUri.split('base64,')[1];
                if (jsonPart) {
                    const decoded = JSON.parse(atob(jsonPart));
                    setMetadata(decoded);
                }
            } catch (err) {
                console.error('Failed to parse NFT metadata:', err);
            }
        }
    }, [tokenUri]);

    if (isLoading) {
        return <Skeleton className="h-[200px] w-[140px] rounded-xl" />;
    }

    if (isError || !metadata) {
        return (
            <div className="h-[200px] w-[140px] rounded-xl bg-muted/20 border border-dashed flex items-center justify-center text-[10px] text-muted-foreground text-center p-2">
                NFT Not Configured
            </div>
        );
    }

    return (
        <div className="relative group cursor-pointer">
            <div className="overflow-hidden rounded-xl border border-border/40 shadow-lg transition-all group-hover:shadow-primary/20 group-hover:border-primary/40 h-[200px] w-[140px]">
                <img
                    src={metadata.image}
                    alt={metadata.name}
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 rounded-xl text-center">
                <p className="text-[10px] font-bold text-primary mb-1">REALFI RECEIPT</p>
                <p className="text-xs font-semibold text-white truncate w-full">{metadata.name}</p>
            </div>
        </div>
    );
}
