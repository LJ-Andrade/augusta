<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use App\Models\Chatbot;

class CheckWidgetDomain
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->route('token');
        $chatbot = Chatbot::where('widget_token', $token)->with('customer')->first();

        if (!$chatbot) {
            return response()->json(['message' => 'Chatbot not found'], 404);
        }

        $origin = $request->header('Origin');
        $isAllowed = false;
        $originHost = $origin ? parse_url($origin, PHP_URL_HOST) : null;

        // 1. Development bypass (always allow common dev ports in debug mode)
        if (config('app.debug') && in_array($originHost, ['localhost', '127.0.0.1', '192.168.1.36'])) {
            $isAllowed = true;
        } 
        
        // 2. Check Customer's Official Domain
        if (!$isAllowed && $originHost) {
            $customer = $chatbot->customer;
            if ($customer && $customer->official_domain) {
                $allowedDomain = parse_url($customer->official_domain, PHP_URL_HOST) ?: $customer->official_domain;
                if ($originHost === $allowedDomain || str_ends_with($originHost, '.' . $allowedDomain)) {
                    $isAllowed = true;
                }
            }
        }

        // 3. Check Chatbot's Authorized Domains (Manual list)
        if (!$isAllowed && $originHost && !empty($chatbot->authorized_domains)) {
            $authorizedDomains = is_array($chatbot->authorized_domains) 
                ? $chatbot->authorized_domains 
                : explode(',', $chatbot->authorized_domains);

            foreach ($authorizedDomains as $domain) {
                $domain = trim($domain);
                if (empty($domain)) continue;
                
                $cleanAllowed = parse_url($domain, PHP_URL_HOST) ?: $domain;
                if ($originHost === $cleanAllowed || str_ends_with($originHost, '.' . $cleanAllowed)) {
                    $isAllowed = true;
                    break;
                }
            }
        }

        if (!$isAllowed && !config('app.debug')) {
             return response()->json([
                'message' => 'Unauthorized domain: ' . ($originHost ?: 'Unknown'),
                'origin' => $origin
             ], 403);
        }

        return $next($request);
    }
}
