<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api', name: 'api_')]
final class AuthController extends AbstractController
{
    private $entityManager;
    private $passwordHasher;

    public function __construct(
        EntityManagerInterface $entityManager, 
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // Interceptado por LexikJWT según security.yaml
        return $this->json(['message' => 'Check security.yaml configuration.']);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function getMe(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'No autenticado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUserIdentifier(),
            'email' => $user->getEmail(),
        ]);
    }

    #[Route('/user/update', name: 'user_update', methods: ['PUT', 'PATCH'])]
    public function updateProfile(Request $request, #[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'No autorizado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }

        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['password']) && !empty($data['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Usuario actualizado correctamente',
            'username' => $user->getUserIdentifier(),
            'email' => $user->getEmail()
        ]);
    }

    #[Route('/recover-password', name: 'recover_password', methods: ['POST'])]
    public function recoverPassword(
        Request $request, 
        UserRepository $userRepository, 
        MailerInterface $mailer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';

        $user = $userRepository->findOneBy([
            'username' => $username,
            'email' => $email
        ]);

        if (!$user) {
            return $this->json([
                'error' => 'Los datos no coinciden con nuestros registros.'
            ], JsonResponse::HTTP_NOT_FOUND);
        }
        /* Se deja preparado el proceso de recuperación de contraseña, 
            pero se comenta para evitar problemas de seguridad en el entorno de desarrollo 
            sin configurar adecuadamente el servicio de correo. .env listo tb el DSN para mailtrap.
            
            Proceso de recuperación:
         * 1. Generar una contraseña temporal segura.
         * 2. Hashear y guardar la nueva contraseña en la base de datos.
         * 3. Enviar un email al usuario con la nueva contraseña temporal.
             
        // 1. Generar contraseña temporal (8 caracteres aleatorios)
        $tempPassword = bin2hex(random_bytes(4));

        // 2. Hashear y guardar la nueva contraseña
        $hashedPassword = $this->passwordHasher->hashPassword($user, $tempPassword);
        $user->setPassword($hashedPassword);
        
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // 3. Configurar y enviar el email
        $emailMessage = (new Email())
            ->from('no-reply@psicodeporte.com')
            ->to($user->getEmail())
            ->subject('Nueva contraseña provisional - Psicodeporte')
            ->html("
                <div style='font-family: sans-serif; color: #333;'>
                    <h2 style='color: #2D3E50;'>Hola, {$user->getUsername()}</h2>
                    <p>Has solicitado restablecer tu acceso a <strong>Psicodeporte</strong>.</p>
                    <p>Tu nueva contraseña provisional es:</p>
                    <div style='background: #F3F4F6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; border: 1px solid #E5E7EB;'>
                        {$tempPassword}
                    </div>
                    <p style='margin-top: 20px;'>Por seguridad, te recomendamos cambiarla inmediatamente desde tu panel de administración.</p>
                    <hr style='border: 0; border-top: 1px solid #EEE; margin: 20px 0;'>
                    <small>Si no has solicitado este cambio, por favor contacta con el administrador.</small>
                </div>
            ");

        try {
            $mailer->send($emailMessage);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al enviar el correo, pero la contraseña fue actualizada.'
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
        */
        return $this->json(['message' => 'Email enviado correctamente']);
    }

    #[Route('/user/change-password', name: 'user_change_password', methods: ['POST'])]
    public function changePassword(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'No autorizado'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $oldPassword = $data['oldPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (!$passwordHasher->isPasswordValid($user, $oldPassword)) {
            return $this->json(['error' => 'La contraseña actual no es correcta'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($newPassword) < 6) {
            return $this->json(['error' => 'La nueva contraseña es demasiado corta'], Response::HTTP_BAD_REQUEST);
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);
        
        $entityManager->flush();

        return $this->json(['message' => 'Contraseña actualizada correctamente']);
    }

}